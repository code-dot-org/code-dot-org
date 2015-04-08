require 'digest/sha1'

module LevelsHelper

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

  def set_videos_and_blocks_and_callouts
    @autoplay_video_info = select_and_track_autoplay_video
    @callouts = select_and_remember_callouts params[:show_callouts]

    if @level.is_a? Blockly
      @toolbox_blocks ||=
        @level.try(:project_template_level).try(:toolbox_blocks) ||
        @level.toolbox_blocks

      @start_blocks ||=
        @level.try(:project_template_level).try(:start_blocks) ||
        @level.start_blocks

      @code_functions ||=
        @level.try(:project_template_level).try(:code_functions) ||
        @level.code_functions
    end
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

  # XXX Since Blockly doesn't play nice with the asset pipeline, a query param
  # must be specified to bust the CDN cache. CloudFront is enabled to forward
  # query params. Don't cache bust during dev, so breakpoints work.
  # See where ::CACHE_BUST is initialized for more details.
  def blockly_cache_bust
    if ::CACHE_BUST.blank?
      false
    else
      ::CACHE_BUST
    end
  end

  def numeric?(val)
    Float(val) != nil rescue false
  end

  def integral?(val)
    Integer(val) != nil rescue false
  end

  def boolean?(val)
    val == boolean_string_true || val == boolean_string_false
  end

  def blockly_value(val)
    if integral?(val)
      Integer(val)
    elsif numeric?(val)
      Float(val)
    elsif boolean?(val)
      val == boolean_string_true
    else
      val
    end
  end

  def boolean_string_true
    "true"
  end

  def boolean_string_false
    "false"
  end

  # Options hash for all level types
  def app_options
    {
        autoplayVideo: @autoplay_video_info,
        callouts: @callouts
    }
  end

  # Code for generating the blockly options hash
  def blockly_options(local_assigns={})
    # Use values from properties json when available (use String keys instead of Symbols for consistency)
    level = @level.properties.dup || {}

    # Set some specific values
    level['puzzle_number'] = @script_level ? @script_level.position : 1
    level['stage_total'] = @script_level ? @script_level.stage_total : 1
    if @level.is_a?(Maze) && @level.step_mode
      @level.step_mode = blockly_value(@level.step_mode)
      level['step'] = @level.step_mode == 1 || @level.step_mode == 2
      level['stepOnly'] = @level.step_mode == 2
    end

    # Pass blockly the edit mode: "<start|toolbox|required>_blocks"
    level['edit_blocks'] = params[:type]
    level['edit_blocks_success'] = t('builder.success')

    # Map Dashboard-style names to Blockly-style names in level object.
    # Dashboard underscore_names mapped to Blockly lowerCamelCase, or explicit 'Dashboard:Blockly'
    Hash[%w(
      start_blocks
      solution_blocks
      predraw_blocks
      slider_speed
      start_direction
      instructions
      initial_dirt
      final_dirt
      nectar_goal
      honey_goal
      flower_type
      skip_instructions_popup
      is_k1
      required_blocks:levelBuilderRequiredBlocks
      toolbox_blocks:toolbox
      x:initialX
      y:initialY
      maze:map
      ani_gif_url:aniGifURL
      shapeways_url
      images
      free_play
      min_workspace_height
      permitted_errors
      disable_param_editing
      disable_variable_editing
      success_condition:fn_successCondition
      failure_condition:fn_failureCondition
      first_sprite_index
      protaganist_sprite_index
      timeout_failure_tick
      soft_buttons
      edge_collisions
      projectile_collisions
      allow_sprites_outside_playspace
      sprites_hidden_to_start
      background
      coordinate_grid_background
      use_modal_function_editor
      use_contract_editor
      contract_highlight
      contract_collapse
      examples_highlight
      examples_collapse
      definition_highlight
      definition_collapse
      disable_examples
      default_num_example_blocks
      impressive
      open_function_definition
      disable_sharing
      hide_source
      share
      no_padding
      show_finish
      edit_code
      code_functions
      app_width
      app_height
      embed
      generate_function_pass_blocks
      timeout_after_when_run
      custom_game_type
      project_template_level_name
      scrollbars
      last_attempt
      is_project_level
      failure_message_override
      show_clients_in_lobby
      show_routers_in_lobby
      show_add_router_button
      router_expects_packet_header
      client_initial_packet_header
      show_add_packet_button
      show_packet_size_control
      default_packet_size_limit
      show_tabs
      default_tab_index
      show_encoding_controls
      default_enabled_encodings
      show_router_bandwidth_control
      default_router_bandwidth
      show_router_memory_control
      default_router_memory
      show_dns_mode_control
      default_dns_mode
      input_output_table
      complete_on_success_condition_not_goals
    ).map{ |x| x.include?(':') ? x.split(':') : [x,x.camelize(:lower)]}]
    .each do |dashboard, blockly|
      # Select first valid value from 1. local_assigns, 2. property of @level object, 3. named instance variable, 4. properties json
      # Don't override existing valid (non-nil/empty) values
      property = local_assigns[dashboard.to_sym].presence ||
        @level[dashboard].presence ||
        instance_variable_get("@#{dashboard}").presence ||
        level[dashboard].presence
      value = blockly_value(level[blockly] || property)
      level[blockly] = value unless value.nil? # make sure we convert false
    end

    level['images'] = JSON.parse(level['images']) if level['images'].present?

    # Blockly requires startDirection as an integer not a string
    level['startDirection'] = level['startDirection'].to_i if level['startDirection'].present?
    level['sliderSpeed'] = level['sliderSpeed'].to_f if level['sliderSpeed']
    level['scale'] = {'stepSpeed' =>  @level.properties['step_speed'].to_i } if @level.properties['step_speed'].present?

    # Blockly requires these fields to be objects not strings
    (
      %w(map initialDirt finalDirt goal soft_buttons inputOutputTable)
      .concat NetSim.json_object_attrs
    ).each do |x|
      level[x] = JSON.parse(level[x]) if level[x].is_a? String
    end

    # Blockly expects fn_successCondition and fn_failureCondition to be inside a 'goals' object
    if level['fn_successCondition'] || level['fn_failureCondition']
      level['goal'] = {fn_successCondition: level['fn_successCondition'], fn_failureCondition: level['fn_failureCondition']}
      level.delete('fn_successCondition')
      level.delete('fn_failureCondition')
    end

    #Fetch localized strings
    if @level.custom?
      loc_val = data_t("instructions", "#{@level.name}_instruction")
      unless I18n.locale.to_s == 'en-us' || loc_val.nil?
        level['instructions'] = loc_val
      end
    else
      %w(instructions).each do |label|
        val = [@level.game.app, @level.game.name].map { |name|
          data_t("level.#{label}", "#{name}_#{@level.level_num}")
        }.compact.first
        level[label] ||= val unless val.nil?
      end
    end

    # Set some values that Blockly expects on the root of its options string
    app_options = {
      baseUrl: "#{ActionController::Base.asset_host}/blockly/",
      app: @game.try(:app),
      levelId: @level.level_num,
      level: level,
      cacheBust: blockly_cache_bust,
      report: {
          fallback_response: @fallback_response,
          callback: @callback,
      },
      droplet: @game.try(:uses_droplet?),
      pretty: Rails.configuration.pretty_apps ? '' : '.min',
    }
    app_options[:scriptId] = @script.id if @script
    app_options[:levelGameName] = @level.game.name if @level.game
    app_options[:skinId] = @level.skin if @level.is_a?(Blockly)
    app_options[:level_source_id] = @level_source.id if @level_source
    app_options[:sendToPhone] = request.location.try(:country_code) == 'US' ||
        (!Rails.env.production? && request.location.try(:country_code) == 'RD') if request
    app_options[:send_to_phone_url] = @phone_share_url if @phone_share_url
    app_options[:disableSocialShare] = true if (@current_user && @current_user.under_13?) || @embed
    app_options[:isLegacyShare] = true if @is_legacy_share
    app_options[:applabUserId] = applab_user_id if @game == Game.applab

    # Move these values up to the root
    %w(hideSource share noPadding embed).each do |key|
      app_options[key.to_sym] = level[key]
      level.delete key
    end

    app_options
  end

  def string_or_image(prefix, text)
    return unless text
    path, width = text.split(',')
    if %w(.jpg .png .gif).include? File.extname(path)
      "<img src='#{path.strip}' #{"width='#{width.strip}'" if width}></img>"
    elsif File.extname(path).ends_with? '_blocks'
      # '.start_blocks' takes the XML from the start_bslocks of the specified level.
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
    f.check_box field_name_symbol, {}, boolean_string_true, boolean_string_false
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
