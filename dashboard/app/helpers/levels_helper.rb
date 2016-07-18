require 'cdo/script_config'
require 'digest/sha1'
require 'dynamic_config/gatekeeper'
require "firebase_token_generator"

module LevelsHelper
  include ApplicationHelper
  include UsersHelper

  def build_script_level_path(script_level, params = {})
    if script_level.script.name == Script::HOC_NAME
      hoc_chapter_path(script_level.chapter, params)
    elsif script_level.script.name == Script::FLAPPY_NAME
      flappy_chapter_path(script_level.chapter, params)
    elsif params[:puzzle_page]
      puzzle_page_script_stage_script_level_path(script_level.script, script_level.stage, script_level, params[:puzzle_page])
    else
      script_stage_script_level_path(script_level.script, script_level.stage, script_level, params)
    end
  end

  def build_script_level_url(script_level, params = {})
    url_from_path(build_script_level_path(script_level, params))
  end

  def url_from_path(path)
    "#{root_url.chomp('/')}#{path}"
  end

  def readonly_view_options
    level_view_options(@level.id, skip_instructions_popup: true)
    view_options(readonly_workspace: true)
    view_options(callouts: [])
  end

  def set_channel
    # This only works for logged-in users because the storage_id cookie is not
    # sent back to the client if it is modified by ChannelsApi.
    return unless current_user

    if @user
      # "answers" are in the channel so instead of doing
      # set_level_source to load answers when looking at another user,
      # we have to load the channel here.
      channel_token = ChannelToken.find_channel_token(@level, @user)
      readonly_view_options
    else
      channel_token = ChannelToken.find_or_create_channel_token(
        @level,
        current_user,
        request.ip,
        StorageApps.new(storage_id('user')),
        {
          hidden: true,
          useFirebase: use_firebase
        })
    end

    view_options(channel: channel_token.channel) if channel_token
  end

  def use_firebase
    !!@level.game.use_firebase_for_new_project? ||
        !!(request.parameters && request.parameters['useFirebase'])
  end

  def select_and_track_autoplay_video
    return if @level.try(:autoplay_blocked_by_level?)

    autoplay_video = nil

    is_legacy_level = @script_level && @script_level.script.legacy_curriculum?

    if is_legacy_level
      autoplay_video = @level.related_videos.find { |video| !client_state.video_seen?(video.key) }
    elsif @level.specified_autoplay_video
      unless client_state.video_seen?(@level.specified_autoplay_video.key)
        autoplay_video = @level.specified_autoplay_video
      end
    end

    return unless autoplay_video

    client_state.add_video_seen(autoplay_video.key)
    autoplay_video.summarize unless params[:noautoplay]
  end

  def select_and_remember_callouts(always_show = false)
    # Keep track of which callouts had been seen prior to calling add_callout_seen
    all_callouts = @level.available_callouts(@script_level)
    callouts_seen = {}
    all_callouts.each do |c|
      callouts_seen[c.localization_key] = client_state.callout_seen?(c.localization_key)
    end
    # Filter if already seen (unless always_show or canReappear in codeStudio part of qtip_config)
    callouts_to_show = all_callouts.reject do |c|
      begin
        can_reappear = JSON.parse(c.qtip_config || '{}').try(:[], 'codeStudio').try(:[], 'canReappear')
      rescue JSON::ParserError
        can_reappear = false
      end
      !always_show && callouts_seen[c.localization_key] && !can_reappear
    end
    # Mark the callouts as seen
    callouts_to_show.each { |c| client_state.add_callout_seen(c.localization_key) }
    # Localize and propagate the seen property
    callouts_to_show.map do |callout|
      callout_hash = callout.attributes
      callout_hash.delete('localization_key')
      callout_hash['seen'] = always_show ? nil : callouts_seen[callout.localization_key]
      callout_text = data_t('callout.text', callout.localization_key)
      if callout_text.nil?
        callout_hash['localized_text'] = callout.callout_text
      else
        callout_hash['localized_text'] = callout_text
      end
      callout_hash
    end
  end

  # Options hash for all level types
  def app_options
    # Unsafe to generate these twice, so use the cached version if it exists.
    return @app_options unless @app_options.nil?

    set_channel if @level.channel_backed?

    # Always pass user age limit
    view_options(is_13_plus: current_user && !current_user.under_13?)

    view_options(server_level_id: @level.id)
    if @script_level
      view_options(
        stage_position: @script_level.stage.position,
        level_position: @script_level.position
      )
    end

    if @script
      view_options(script_name: @script.name)
    end

    unless params[:share]
      # Set videos and callouts.
      view_options(
        autoplay_video: select_and_track_autoplay_video,
        callouts: select_and_remember_callouts(params[:show_callouts])
      )
    end

    # External project levels are any levels of type 'external' which use
    # the projects code to save and load the user's progress on that level.
    view_options(is_external_project_level: true) if @level.is_a? Pixelation

    view_options(is_channel_backed: true) if @level.channel_backed?

    post_milestone = @script ? Gatekeeper.allows('postMilestone', where: {script_name: @script.name}, default: true) : true
    view_options(post_milestone: post_milestone)

    @public_caching = @script ? ScriptConfig.allows_public_caching_for_script(@script.name) : false
    view_options(public_caching: @public_caching)

    if PuzzleRating.enabled?
      view_options(puzzle_ratings_url: puzzle_ratings_path)
    end

    if AuthoredHintViewRequest.enabled?
      view_options(authored_hint_view_requests_url: authored_hint_view_requests_path(format: :json))
    end

    if @user
      recent_driver = UserLevel.most_recent_driver(@script, @level, @user)
      if recent_driver
        level_view_options(pairing_driver: recent_driver)
      end
    end

    if @level.is_a? Blockly
      @app_options = blockly_options
    elsif @level.is_a?(DSLDefined) || @level.is_a?(FreeResponse)
      @app_options = question_options
    elsif @level.is_a? Widget
      @app_options = widget_options
    elsif @level.unplugged?
      @app_options = unplugged_options
    else
      # currently, all levels are Blockly or DSLDefined except for Unplugged
      @app_options = view_options.camelize_keys
    end

    @app_options[:dialog] = {
      skipSound: !!(@level.properties['options'].try(:[], 'skip_sound')),
      preTitle: @level.properties['pre_title'],
      fallbackResponse: @fallback_response.to_json,
      callback: @callback,
      sublevelCallback: @sublevel_callback,
      app: @level.type.underscore,
      level: @level.level_num,
      shouldShowDialog: @level.properties['skip_dialog'].blank? && @level.properties['options'].try(:[], 'skip_dialog').blank?
    }

    @app_options
  end

  # Helper that renders the _apps_dependencies partial with a configuration
  # appropriate to the level being rendered.
  def render_app_dependencies
    use_droplet = app_options[:droplet]
    use_makerlab = @level.is_a?(Applab) && @level.makerlab_enabled
    use_netsim = @level.game == Game.netsim
    use_applab = @level.game == Game.applab
    use_gamelab = @level.game == Game.gamelab
    use_phaser = @level.game == Game.craft
    use_blockly = !use_droplet && !use_netsim
    hide_source = app_options[:hideSource]
    render partial: 'levels/apps_dependencies',
           locals: {
               app: app_options[:app],
               use_droplet: use_droplet,
               use_netsim: use_netsim,
               use_blockly: use_blockly,
               use_applab: use_applab,
               use_gamelab: use_gamelab,
               use_phaser: use_phaser,
               use_makerlab: use_makerlab,
               hide_source: hide_source,
               static_asset_base_path: app_options[:baseUrl]
           }
  end

  # Options hash for Widget
  def widget_options
    app_options = {}
    app_options[:level] ||= {}
    app_options[:level].merge! @level.properties.camelize_keys
    app_options.merge! view_options.camelize_keys
    app_options
  end

  def unplugged_options
    app_options = {}
    app_options[:level] ||= {}
    app_options[:level].merge! level_view_options(@level.id)
    app_options.merge! view_options.camelize_keys
    app_options
  end

  # Options hash for Multi/Match/FreeResponse/TextMatch/ContractMatch/External/LevelGroup levels
  def question_options
    app_options = {}

    level_options = app_options[:level] ||= Hash.new

    level_options[:lastAttempt] = @last_attempt
    level_options.merge! @level.properties.camelize_keys

    unless current_user && (current_user.teachers.any? ||
        (@level.try(:peer_reviewable) && current_user.teacher? && Plc::UserCourseEnrollment.exists?(user: current_user)))
      # only students with teachers or teachers enrolled in PLC submitting for a peer reviewable level
      level_options['submittable'] = false
    end

    app_options.merge! view_options.camelize_keys

    app_options[:submitted] = level_view_options(@level.id)[:submitted]
    app_options[:unsubmitUrl] = level_view_options(@level.id)[:unsubmit_url]

    app_options
  end

  # Options hash for Blockly
  def blockly_options
    l = @level
    raise ArgumentError.new("#{l} is not a Blockly object") unless l.is_a? Blockly
    # Level-dependent options
    app_options = l.blockly_app_options(l.game, l.skin).dup
    level_options = l.blockly_level_options.dup
    app_options[:level] = level_options

    # Locale-dependent option
    # Fetch localized strings
    if l.custom?
      loc_val = data_t("instructions", "#{l.name}_instruction")
      unless I18n.en? || loc_val.nil?
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
    app_options[:scriptName] = script.name if script

    # ScriptLevel-dependent option
    script_level = @script_level
    level_options['puzzle_number'] = script_level ? script_level.position : 1
    level_options['stage_total'] = script_level ? script_level.stage_total : 1

    # Unused Blocks option
    ## TODO (elijah) replace this with more-permanent level configuration
    ## options once the experimental period is over.

    ## allow unused blocks for all levels except Jigsaw
    app_options[:showUnusedBlocks] = @game ? @game.name != 'Jigsaw' : true

    ## Allow gatekeeper to disable otherwise-enabled unused blocks in a
    ## cascading way; more specific options take priority over
    ## less-specific options.
    if script && script_level && app_options[:showUnusedBlocks] != false

      # puzzle-specific
      enabled = Gatekeeper.allows('showUnusedBlocks', where: {
        script_name: script.name,
        stage: script_level.stage.position,
        puzzle: script_level.position
      }, default: nil)

      # stage-specific
      enabled = Gatekeeper.allows('showUnusedBlocks', where: {
        script_name: script.name,
        stage: script_level.stage.position,
      }, default: nil) if enabled.nil?

      # script-specific
      enabled = Gatekeeper.allows('showUnusedBlocks', where: {
        script_name: script.name,
      }, default: nil) if enabled.nil?

      # global
      enabled = Gatekeeper.allows('showUnusedBlocks', default: true) if enabled.nil?

      app_options[:showUnusedBlocks] = enabled
    end

    # Edit blocks-dependent options
    if level_view_options(@level.id)[:edit_blocks]
      # Pass blockly the edit mode: "<start|toolbox|required>_blocks"
      level_options['edit_blocks'] = level_view_options(@level.id)[:edit_blocks]
      level_options['edit_blocks_success'] = t('builder.success')
      level_options['toolbox'] = level_view_options(@level.id)[:toolbox_blocks]
      level_options['embed'] = false
      level_options['hideSource'] = false
    end

    if @level.game.uses_pusher?
      app_options['usePusher'] = CDO.use_pusher
      app_options['pusherApplicationKey'] = CDO.pusher_application_key
    end

    if @level.is_a? NetSim
      app_options['netsimMaxRouters'] = CDO.netsim_max_routers
    end

    # Process level view options
    level_overrides = level_view_options(@level.id).dup
    if level_options['embed'] || level_overrides[:embed]
      level_overrides[:hide_source] = true
      level_overrides[:show_finish] = true
    end
    if level_overrides[:embed]
      view_options(no_header: true, no_footer: true, white_background: true)
    end

    view_options(has_contained_levels: @level.try(:contained_levels).present?)

    # Add all level view options to the level_options hash
    level_options.merge! level_overrides.camelize_keys
    app_options.merge! view_options.camelize_keys

    # Move these values up to the app_options hash
    %w(hideSource share embed).each do |key|
      if level_options[key]
        app_options[key.to_sym] = level_options.delete key
      end
    end

    # User/session-dependent options
    app_options[:disableSocialShare] = true if (current_user && current_user.under_13?) || app_options[:embed]
    app_options[:isLegacyShare] = true if @is_legacy_share
    app_options[:isMobile] = true if browser.mobile?
    app_options[:applabUserId] = applab_user_id if @game == Game.applab
    app_options[:firebaseName] = CDO.firebase_name if @game == Game.applab
    app_options[:firebaseAuthToken] = firebase_auth_token if @game == Game.applab
    app_options[:isAdmin] = true if @game == Game.applab && current_user && current_user.admin?
    app_options[:isSignedIn] = !current_user.nil?
    app_options[:pinWorkspaceToBottom] = true if l.enable_scrolling?
    app_options[:hasVerticalScrollbars] = true if l.enable_scrolling?
    app_options[:showExampleTestButtons] = true if l.enable_examples?
    app_options[:rackEnv] = CDO.rack_env
    app_options[:report] = {
        fallback_response: @fallback_response,
        callback: @callback,
        sublevelCallback: @sublevel_callback,
    }

    unless params[:no_last_attempt]
      level_options[:lastAttempt] = @last_attempt
      if @last_activity
        level_options[:lastAttemptTimestamp] = @last_activity.updated_at.to_datetime.to_milliseconds
      end
    end

    if current_user.nil? || current_user.teachers.empty?
      # only students with teachers should be able to submit
      level_options['submittable'] = false
    end

    # Request-dependent option
    app_options[:sendToPhone] = request.location.try(:country_code) == 'US' ||
        (!Rails.env.production? && request.location.try(:country_code) == 'RD') if request
    app_options[:send_to_phone_url] = send_to_phone_url if app_options[:sendToPhone]

    if (@game && @game.owns_footer_for_share?) || @is_legacy_share
      app_options[:copyrightStrings] = build_copyright_strings
    end

    app_options
  end

  def build_copyright_strings
    # TODO(brent): These would ideally also go in _javascript_strings.html right now, but it can't
    # deal with params.
    {
        :thank_you => URI.escape(I18n.t('footer.thank_you')),
        :help_from_html => I18n.t('footer.help_from_html'),
        :art_from_html => URI.escape(I18n.t('footer.art_from_html', current_year: Time.now.year)),
        :code_from_html => URI.escape(I18n.t('footer.code_from_html')),
        :powered_by_aws => I18n.t('footer.powered_by_aws'),
        :trademark => URI.escape(I18n.t('footer.trademark', current_year: Time.now.year))
    }
  end

  def string_or_image(prefix, text, source_level = nil)
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
      level_name = source_level ? source_level.name : @level.name
      data_t(prefix + '.' + level_name, text)
    end
  end

  def multi_t(level, text)
    string_or_image(level.type.underscore, text, level)
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
    elsif @level.try(:is_project_level) && data_t("game.name", @game.name)
      data_t "game.name", @game.name
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

  # Assign a firebase authentication token based on the firebase secret,
  # plus either the dashboard user id or the rails session id. This is
  # sufficient for rate limiting, since it uniquely identifies users.
  #
  # TODO(dave): include the storage_id associated with the user id
  # (if one exists), so auth can be used to assign appropriate privileges
  # to channel owners.
  def firebase_auth_token
    return nil unless CDO.firebase_secret

    if current_user
      user_id = current_user.id.to_s
    elsif session.id
      user_id = session.id.to_s
    else
      # a signed-out user may not have a session id on their first visit
      user_id = 'anon'
    end
    payload = {
      :uid => user_id,
      :is_dashboard_user => !!current_user
    }
    options = {}
    # Provides additional debugging information to the browser when
    # security rules are evaluated.
    options[:debug] = true if CDO.firebase_debug && CDO.rack_env?(:development)

    # TODO(dave): cache token generator across requests
    generator = Firebase::FirebaseTokenGenerator.new(CDO.firebase_secret)
    generator.create_token(payload, options)
  end

  # If this is a restricted level (i.e., applab) and user is under 13, redirect
  # with a flash alert.
  def redirect_under_13(level)
    # Note that Game.applab includes both App Lab and Maker Lab.
    return unless level.game == Game.applab || level.game == Game.gamelab

    if current_user && current_user.under_13?
      redirect_to '/', :flash => { :alert => I18n.t("errors.messages.too_young") }
      return true
    end
  end

  def can_view_solution?
    if current_user && @level.try(:ideal_level_source_id) && @script_level && !@script.hide_solutions?
      Ability.new(current_user).can? :view_level_solutions, @script
    end
  end
end
