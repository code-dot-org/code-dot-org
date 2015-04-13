require 'digest/sha1'

module LevelsHelper
  include ViewOptionsHelper
  def build_script_level_path(script_level)
    if script_level.script.name == Script::HOC_NAME
      hoc_chapter_path(script_level.chapter)
    elsif script_level.script.name == Script::FLAPPY_NAME
      flappy_chapter_path(script_level.chapter)
    else
      script_stage_script_level_path(script_level.script, script_level.stage, script_level.position)
    end
  end

  def build_script_level_url(script_level)
    url_from_path(build_script_level_path(script_level))
  end

  def url_from_path(path)
    "#{root_url.chomp('/')}#{path}"
  end

  def set_videos_and_callouts
    view_options(
        autoplay_video: select_and_track_autoplay_video,
        callouts: select_and_remember_callouts(params[:show_callouts])
    )
  end

  def select_and_track_autoplay_video
    seen_videos = session[:videos_seen] || Set.new
    autoplay_video = nil

    is_legacy_level = @script_level && @script_level.script.legacy_curriculum?

    if is_legacy_level
      autoplay_video = @level.related_videos.find { |video| !seen_videos.include?(video.key) }
    elsif @level.specified_autoplay_video
      unless seen_videos.include?(@level.specified_autoplay_video.key)
        autoplay_video = @level.specified_autoplay_video
      end
    end

    return unless autoplay_video

    seen_videos.add(autoplay_video.key)
    session[:videos_seen] = seen_videos
    autoplay_video.summarize unless params[:noautoplay]
  end

  def select_and_remember_callouts(always_show = false)
    session[:callouts_seen] ||= Set.new
    # Filter if already seen (unless always_show)
    callouts_to_show = @level.available_callouts(@script_level)
      .reject { |c| !always_show && session[:callouts_seen].include?(c.localization_key) }
      .each { |c| session[:callouts_seen].add(c.localization_key) }
    # Localize
    callouts_to_show.map do |callout|
      callout_hash = callout.attributes
      callout_hash.delete('localization_key')
      callout_text = data_t('callout.text', callout.localization_key)
      if I18n.locale == 'en-us' || callout_text.nil?
        callout_hash['localized_text'] = callout.callout_text
      else
        callout_hash['localized_text'] = callout_text
      end
      callout_hash
    end
  end

  # Options hash for all level types
  def app_options
    return blockly_options if @level.is_a? Blockly
    Hash[view_options.map{|key, value|[key.to_s.camelize(:lower), value]}]
  end

  # Code for generating the blockly options hash
  def blockly_options
    l = @level
    throw ArgumentError("#{l} is not a Blockly object") unless l.is_a? Blockly
    # Level-dependent options
    app_options = l.blockly_options
    level_options = app_options[:level]

    # Locale-dependent option
    # Fetch localized strings
    if l.custom?
      loc_val = data_t("instructions", "#{l.name}_instruction")
      unless I18n.locale.to_s == 'en-us' || loc_val.nil?
        level_options['instructions'] = loc_val
      end
    else
      %w(instructions).each do |label|
        val = [l.game.app, l.game.name].map { |name|
          data_t("level.#{label}", "#{name}_#{l.level_num}")
        }.compact.first
        level_options[label] ||= val unless val.nil?
      end
    end

    # Script-dependent option
    script = @script
    app_options[:scriptId] = script.id if script

    # ScriptLevel-dependent option
    script_level = @script_level
    level_options['puzzle_number'] = script_level ? script_level.position : 1
    level_options['stage_total'] = script_level ? script_level.stage_total : 1

    # LevelSource-dependent options
    app_options[:level_source_id] = @level_source.id if @level_source
    app_options[:send_to_phone_url] = @phone_share_url if @phone_share_url

    # Edit blocks-dependent options
    if level_options['edit_blocks']
      # Pass blockly the edit mode: "<start|toolbox|required>_blocks"
      level_options['edit_blocks'] = @edit_blocks
      level_options['edit_blocks_success'] = t('builder.success')
    end

    # Process level view options
    level_overrides = level_view_options.dup
    if level_options['embed'] || level_overrides[:embed]
      level_overrides.merge!(hide_source: true, show_finish: true, embed: true)
      view_options(no_padding: true, no_header: true, no_footer: true, white_background: true)
    end
    view_options(no_footer: true) if level_overrides[:share] && browser.mobile?

    level_overrides.merge!(no_padding: view_options[:no_padding])

    # Add all level view options to the level_options hash
    level_options.merge!(Hash[level_overrides.map{|key, value|[key.to_s.camelize(:lower), value]}])

    # Move these values up to the app_options hash
    %w(hideSource share noPadding embed).each do |key|
      if level_options[key]
        app_options[key.to_sym] = level_options.delete key
      end
    end

    # User/session-dependent options
    app_options[:disableSocialShare] = true if (@current_user && @current_user.under_13?) || app_options[:embed]
    app_options[:isLegacyShare] = true if @is_legacy_share
    app_options[:applabUserId] = @applab_user_id
    app_options[:report] = {
        fallback_response: @fallback_response,
        callback: @callback,
    }
    level_options[:lastAttempt] = @last_attempt

    # Request-dependent option
    app_options[:sendToPhone] = request.location.try(:country_code) == 'US' ||
        (!Rails.env.production? && request.location.try(:country_code) == 'RD') if request

    app_options
  end

  LevelViewOptions = Struct.new *%i(
    success_condition
    start_blocks
    toolbox_blocks
    edit_blocks
    skip_instructions_popup
    embed
    share
    hide_source
  )
  # Sets custom level options to be used by the view layer. The option hash is frozen once read.
  def level_view_options(opts = nil)
    @level_view_options ||= LevelViewOptions.new
    if opts.blank?
      @level_view_options.freeze.to_h
    else
      opts.each{|k, v| @level_view_options[k] = v}
    end
  end

  def string_or_image(prefix, text)
    return unless text
    path, width = text.split(',')
    if %w(.jpg .png .gif).include? File.extname(path)
      "<img src='#{path.strip}' #{"width='#{width.strip}'" if width}></img>"
    elsif File.extname(path).ends_with? '_blocks'
      # '.start_blocks' takes the XML from the start_blocks of the specified level.
      ext = File.extname(path)
      base_level = File.basename(path, ext)
      level = Level.find_by(name: base_level)
      block_type = ext.slice(1..-1)
      content_tag(:iframe, '', {
          src: url_for(controller: :levels, action: :embed_blocks, level_id: level.id, block_type: block_type).strip,
          width: width ? width.strip : '100%',
          scrolling: 'no',
          seamless: 'seamless',
          style: 'border: none;',
      })

    elsif File.extname(path) == '.level'
      base_level = File.basename(path, '.level')
      level = Level.find_by(name: base_level)
      content_tag(:div,
        content_tag(:iframe, '', {
          src: url_for(level_id: level.id, controller: :levels, action: :embed_level).strip,
          width: (width ? width.strip : '100%'),
          scrolling: 'no',
          seamless: 'seamless',
          style: 'border: none;'
        }), {class: 'aspect-ratio'})
    else
      data_t(prefix + '.' + @level.name, text)
    end
  end

  def multi_t(text)
    string_or_image('multi', text)
  end

  def match_t(text)
    string_or_image('match', text)
  end

  def level_title
    if @script_level
      script =
        if @script_level.script.flappy?
          data_t 'game.name', @game.name
        else
          data_t_suffix 'script.name', @script_level.script.name, 'title'
        end
      stage = @script_level.name
      position = @script_level.position
      if @script_level.script.stages.many?
        "#{script}: #{stage} ##{position}"
      elsif @script_level.position != 1
        "#{script} ##{position}"
      else
        script
      end
    else
      @level.key
    end
  end

  def video_key_choices
    Video.all.map(&:key)
  end

  # Constructs pairs of [filename, asset path] for a dropdown menu of available ani-gifs
  def instruction_gif_choices
    all_filenames = Dir.chdir(Rails.root.join('config', 'scripts', instruction_gif_relative_path)){ Dir.glob(File.join("**", "*")) }
    all_filenames.map {|filename| [filename, instruction_gif_asset_path(filename)] }
  end

  def instruction_gif_asset_path filename
    File.join('/', instruction_gif_relative_path, filename)
  end

  def instruction_gif_relative_path
    File.join("script_assets", "k_1_images", "instruction_gifs")
  end

  def boolean_check_box(f, field_name_symbol)
    f.check_box field_name_symbol, {}, JSONValue.boolean_string_true, JSONValue.boolean_string_false
  end

  SoftButton = Struct.new(:name, :value)
  def soft_button_options
    [
        SoftButton.new('Left', 'leftButton'),
        SoftButton.new('Right', 'rightButton'),
        SoftButton.new('Down', 'downButton'),
        SoftButton.new('Up', 'upButton'),
    ]
  end

  # Unique, consistent ID for a user of an applab app.
  def applab_user_id
    channel_id = "1337" # Stub value, until storage for channel_id's is available.
    user_id = current_user ? current_user.id.to_s : session.id
    Digest::SHA1.base64digest("#{channel_id}:#{user_id}").tr('=', '')
  end
end
