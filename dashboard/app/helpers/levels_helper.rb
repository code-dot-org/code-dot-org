require 'cdo/script_config'
require 'cdo/redcarpet/inline'
require 'digest/sha1'
require 'dynamic_config/gatekeeper'
require 'firebase_token_generator'
require 'image_size'
require 'cdo/firehose'
require 'cdo/languages'
require 'net/http'
require 'uri'
require 'json'

module LevelsHelper
  include ApplicationHelper
  include UsersHelper
  include NotesHelper
  include AzureTextToSpeech

  def build_script_level_path(script_level, params = {})
    if script_level.script.name == Script::HOC_NAME
      hoc_chapter_path(script_level.chapter, params)
    elsif script_level.script.name == Script::FLAPPY_NAME
      flappy_chapter_path(script_level.chapter, params)
    elsif params[:puzzle_page]
      if script_level.lesson.numbered_lesson?
        puzzle_page_script_lesson_script_level_path(script_level.script, script_level.lesson, script_level, params[:puzzle_page])
      else
        puzzle_page_script_lockable_stage_script_level_path(script_level.script, script_level.lesson, script_level, params[:puzzle_page])
      end
    elsif params[:sublevel_position]
      sublevel_script_lesson_script_level_path(script_level.script, script_level.lesson, script_level, params[:sublevel_position])
    elsif !script_level.lesson.numbered_lesson?
      script_lockable_stage_script_level_path(script_level.script, script_level.lesson, script_level, params)
    elsif script_level.bonus
      query_params = params.merge(level_name: script_level.level.name)
      script_lesson_extras_path(script_level.script.name, script_level.lesson.relative_position, query_params)
    else
      script_lesson_script_level_path(script_level.script, script_level.lesson, script_level, params)
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

  # Provide a presigned URL that can upload the video log to S3 for processing
  # in to a video. Currently only used by Dance, in both project mode and for
  # the last level of the progression.
  # NOTE: any client that has this value set will be able to upload a log and
  # regenerate the share video. Make sure this is only provided to views with
  # edit permission (ie, the project creator, but not the sharing view)
  def replay_video_view_options(channel = nil)
    return unless DCDO.get('share_video_generation_enabled', true)

    signed_url = AWS::S3.presigned_upload_url(
      "cdo-p5-replay-source.s3.amazonaws.com",
      "source/#{channel || @view_options['channel']}",
      virtual_host: true
    )

    # manually force https since the AWS SDK assumes all virtual hosts are
    # http-only
    signed_url.sub!('http:', 'https:')

    # manually point to our custom CloudFront domain so we don't have to worry
    # about whitelists. Note that we _should_ be able to do this by just
    # passing the custom domain as the first argument to presigned_upload_url,
    # but the Ruby AWS SDK appears to mess that up.
    # TODO: elijah: explore other options for doing this
    signed_url.sub!('cdo-p5-replay-source.s3.amazonaws.com', 'dance-api.code.org')

    view_options(signed_replay_log_url: signed_url)
  end

  # If given a user, find the channel associated with the given level/user.
  # Otherwise, gets the storage_id associated with the (potentially signed out)
  # current user, and either finds or creates a channel for the level
  def get_channel_for(level, user = nil)
    if user
      # "answers" are in the channel so instead of doing
      # set_level_source to load answers when looking at another user,
      # we have to load the channel here.
      user_storage_id = storage_id_for_user_id(user.id)
      channel_token = ChannelToken.find_channel_token(level, user_storage_id)
    else
      user_storage_id = get_storage_id
      channel_token = ChannelToken.find_or_create_channel_token(
        level,
        request.ip,
        user_storage_id,
        {
          hidden: true,
        }
      )
    end

    channel_token&.channel
  end

  # If given a level, script and a user, returns whether the level
  # has been started by the user. A channel-backed level is considered started when a
  # channel is created for the level, which happens when the user first visits the level page.
  # Other levels are considered started when progress has been saved for the level (for example
  # clicking the run button saves progress).
  def level_started?(level, script, user)
    return false unless user.present?

    if level.channel_backed?
      return get_channel_for(level, user).present?
    else
      user.last_attempt(level, script).present?
    end
  end

  def select_and_track_autoplay_video
    return if @level.try(:autoplay_blocked_by_level?)

    autoplay_video = nil

    is_legacy_level = @script_level && @script_level.script.legacy_curriculum?

    if is_legacy_level
      autoplay_video = @level.related_videos.find {|video| !client_state.video_seen?(video.key)}
    elsif @level.specified_autoplay_video
      unless client_state.video_seen?(@level.specified_autoplay_video.key)
        autoplay_video = @level.specified_autoplay_video
      end
    end

    return unless autoplay_video

    autoplay_video.summarize
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
    callouts_to_show.each {|c| client_state.add_callout_seen(c.localization_key)}
    # Localize and propagate the seen property
    callouts_to_show.map do |callout|
      callout_hash = callout.attributes
      callout_hash.delete('localization_key')
      callout_hash['seen'] = always_show ? nil : callouts_seen[callout.localization_key]
      callout_text = data_t('callout.text', callout.localization_key)
      callout_hash['localized_text'] = callout_text.nil? ? callout.callout_text : callout_text
      callout_hash
    end
  end

  # Options hash for all level types
  def app_options
    # Unsafe to generate these twice, so use the cached version if it exists.
    return @app_options unless @app_options.nil?

    if @level.channel_backed? && params[:action] != 'edit_blocks'
      view_options(
        channel: get_channel_for(@level, @user),
        server_project_level_id: @level.project_template_level.try(:id),
      )
      # readonly if viewing another user's channel
      readonly_view_options if @user
    end

    # Always pass user age limit
    view_options(is_13_plus: current_user && !current_user.under_13?)

    view_options(user_id: current_user.id) if current_user

    view_options(server_level_id: @level.id)
    if @script_level
      view_options(
        lesson_position: @script_level.lesson.absolute_position,
        level_position: @script_level.position,
        next_level_url: @script_level.next_level_or_redirect_path_for_user(current_user, @stage)
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

    post_milestone = @script ? Gatekeeper.allows('postMilestone', where: {script_name: @script.name}, default: true) : true
    post_failed_run_milestone = @script ? Gatekeeper.allows('postFailedRunMilestone', where: {script_name: @script.name}, default: true) : true
    view_options(post_milestone_mode: post_milestone_mode(post_milestone, post_failed_run_milestone))

    @public_caching = @script ? ScriptConfig.allows_public_caching_for_script(@script.name) : false
    view_options(public_caching: @public_caching)

    if PuzzleRating.enabled?
      view_options(puzzle_ratings_url: puzzle_ratings_path)
    end

    if AuthoredHintViewRequest.enabled?
      view_options(authored_hint_view_requests_url: authored_hint_view_requests_path(format: :json))
      if current_user && @script
        view_options(authored_hints_used_ids: AuthoredHintViewRequest.hints_used(current_user.id, @script.id, @level.id).pluck(:hint_id).uniq)
      end
    end

    if @user
      pairing_check_user = @user
    elsif @level.channel_backed?
      pairing_check_user = current_user
    end

    if pairing_check_user
      recent_driver, recent_attempt, recent_user = UserLevel.most_recent_driver(@script, @level, pairing_check_user)
      if recent_driver && !recent_user.is_a?(DeletedUser)
        level_view_options(@level.id, pairing_driver: recent_driver)
        if recent_attempt
          level_view_options(@level.id, pairing_attempt: edit_level_source_path(recent_attempt)) if recent_attempt
        elsif @level.channel_backed?
          recent_channel = get_channel_for(@level, recent_user) if recent_user
          level_view_options(@level.id, pairing_channel_id: recent_channel) if recent_channel
        end
      end
    end

    @app_options =
      if @level.is_a? Blockly
        blockly_options
      elsif @level.is_a?(Weblab) || @level.is_a?(Fish) || @level.is_a?(Ailab) || @level.is_a?(Javalab)
        non_blockly_puzzle_options
      elsif @level.is_a?(DSLDefined) || @level.is_a?(FreeResponse) || @level.is_a?(CurriculumReference)
        question_options
      elsif @level.is_a? Widget
        widget_options
      elsif @level.unplugged?
        unplugged_options
      else
        # currently, all levels are Blockly or DSLDefined except for Unplugged
        view_options.camelize_keys
      end

    if @script_level && @level.can_have_feedback?
      @app_options[:serverScriptId] = @script.id
      @app_options[:serverScriptLevelId] = @script_level.id
      @app_options[:verifiedTeacher] = current_user && current_user.authorized_teacher?
    end

    # Blockly caches level properties, whereas this field depends on the user
    @app_options['teacherMarkdown'] = @level.localized_teacher_markdown if can_view_teacher_markdown?

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

    # Sets video and additional reference options for this level
    if @app_options[:level]
      @app_options[:level][:levelVideos] = @level.related_videos.map(&:summarize)
      @app_options[:level][:mapReference] = @level.map_reference
      @app_options[:level][:referenceLinks] = @level.reference_links

      if (@user || current_user) && @script
        @app_options[:level][:isStarted] = level_started?(@level, @script, @user || current_user)
      end
    end

    if current_user
      section =
        if @script
          current_user.sections_as_student.detect {|s| s.script_id == @script.id} ||
            current_user.sections_as_student.first
        else
          current_user.sections_as_student.first
        end
      if section && section.first_activity_at.nil?
        section.first_activity_at = DateTime.now
        section.save(validate: false)
      end
      @app_options[:experiments] =
        Experiment.get_all_enabled(user: current_user, section: section, script: @script).pluck(:name)
      @app_options[:usingTextModePref] = !!current_user.using_text_mode
      @app_options[:usingDarkModePref] = !!current_user.using_dark_mode
      @app_options[:userSharingDisabled] = current_user.sharing_disabled?
    end

    @app_options
  end

  # Helper that renders the _apps_dependencies partial with a configuration
  # appropriate to the level being rendered.
  def render_app_dependencies
    use_droplet = @level.uses_droplet?
    use_netsim = @level.game == Game.netsim
    use_applab = @level.game == Game.applab
    use_gamelab = @level.is_a?(Gamelab)
    use_weblab = @level.game == Game.weblab
    use_phaser = @level.game == Game.craft
    use_javalab = @level.is_a?(Javalab)
    use_blockly = !use_droplet && !use_netsim && !use_weblab && !use_javalab
    use_p5 = @level.is_a?(Gamelab)
    hide_source = app_options[:hideSource]
    use_google_blockly = @level.is_a?(Flappy) || view_options[:useGoogleBlockly]
    render partial: 'levels/apps_dependencies',
      locals: {
        app: app_options[:app],
        use_droplet: use_droplet,
        use_google_blockly: use_google_blockly,
        use_blockly: use_blockly,
        use_applab: use_applab,
        use_gamelab: use_gamelab,
        use_weblab: use_weblab,
        use_phaser: use_phaser,
        use_p5: use_p5,
        hide_source: hide_source,
        preload_asset_list: @level.try(:preload_asset_list),
        static_asset_base_path: app_options[:baseUrl]
      }
  end

  # Options hash for Widget
  def widget_options
    app_options = {}
    app_options[:level] ||= {}
    app_options[:level].merge! @level.properties.camelize_keys
    app_options.merge! view_options.camelize_keys
    set_puzzle_position_options(app_options[:level])
    app_options
  end

  def set_tts_options(level_options, app_options)
    # Text to speech - set url to empty string if the instructions are empty
    if @script && @script.text_to_speech_enabled?
      level_options['ttsShortInstructionsUrl'] = @level.tts_short_instructions_text.empty? ? "" : @level.tts_url(@level.tts_short_instructions_text)
      level_options['ttsLongInstructionsUrl'] = @level.tts_long_instructions_text.empty? ? "" : @level.tts_url(@level.tts_long_instructions_text)
    end

    app_options[:textToSpeechEnabled] = @script.try(:text_to_speech_enabled?)
  end

  def set_hint_prompt_options(level_options)
    # Default was selected based on analysis of calculated thresholds for
    # levels in Courses 2, 3, 4 and the 2017 versions of Courses A-F. See PR
    # #36507 for more details.
    default_hint_prompt_attempts_threshold = 6.5
    if @script&.hint_prompt_enabled?
      level_options[:hintPromptAttemptsThreshold] = @level.hint_prompt_attempts_threshold || default_hint_prompt_attempts_threshold
    end
  end

  def set_puzzle_position_options(level_options)
    script_level = @script_level
    level_options['puzzle_number'] = script_level ? script_level.position : 1
    level_options['stage_total'] = script_level ? script_level.lesson_total : 1
  end

  # Options hash for non-blockly puzzle apps
  def non_blockly_puzzle_options
    # Level-dependent options
    app_options = {}

    l = @level
    raise ArgumentError.new("#{l} is not a non-blockly puzzle object") unless l.respond_to? :non_blockly_puzzle_level_options

    level_options = l.non_blockly_puzzle_level_options.dup
    app_options[:level] = level_options

    set_puzzle_position_options(level_options)

    # Ensure project_template_level allows start_sources to be overridden
    level_options['startSources'] = @level.try(:project_template_level).try(:start_sources) || @level.start_sources

    set_tts_options(level_options, app_options)

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

    app_options[:app] = l.game.app
    app_options[:baseUrl] = Blockly.base_url
    app_options[:report] = {
      fallback_response: @fallback_response,
      callback: @callback,
      sublevelCallback: @sublevel_callback,
    }

    if (@game && @game.owns_footer_for_share?) || @legacy_share_style
      app_options[:copyrightStrings] = build_copyright_strings
    end

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
        (@level.try(:peer_reviewable?) && current_user.teacher? && Plc::UserCourseEnrollment.exists?(user: current_user)))
      # only students with teachers or teachers enrolled in PLC submitting for a peer reviewable level
      level_options['submittable'] = false
    end

    app_options.merge! view_options.camelize_keys

    app_options[:submitted] = level_view_options(@level.id)[:submitted]
    app_options[:unsubmitUrl] = level_view_options(@level.id)[:unsubmit_url]

    app_options
  end

  def firebase_options
    fb_options = {}

    if @level.game.use_firebase?
      fb_options[:firebaseName] = CDO.firebase_name
      fb_options[:firebaseAuthToken] = firebase_auth_token
      fb_options[:firebaseSharedAuthToken] = firebase_shared_auth_token
      fb_options[:firebaseChannelIdSuffix] = CDO.firebase_channel_id_suffix
    end

    fb_options
  end

  def azure_speech_service_options
    return {} unless @level.game.use_azure_speech_service?
    {voices: AzureTextToSpeech.get_voices || {}}
  end

  def disallowed_html_tags
    DCDO.get('disallowed_html_tags', [])
  end

  # Options hash for Blockly
  def blockly_options
    l = @level
    raise ArgumentError.new("#{l} is not a Blockly object") unless l.is_a? Blockly
    # Level-dependent options
    app_options = l.blockly_app_options(l.game, l.skin).dup
    level_options = l.localized_blockly_level_options(@script).dup
    app_options[:level] = level_options

    # Script-dependent option
    script = @script
    app_options[:scriptId] = script.id if script
    app_options[:scriptName] = script.name if script

    # ScriptLevel-dependent option
    script_level = @script_level
    level_options['puzzle_number'] = script_level ? script_level.position : 1
    level_options['stage_total'] = script_level ? script_level.lesson_total : 1
    level_options['final_level'] = script_level.final_level? if script_level

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

    set_tts_options(level_options, app_options)
    set_hint_prompt_options(level_options)

    if @level.is_a? NetSim
      app_options['netsimMaxRouters'] = CDO.netsim_max_routers
    end

    # Allow levelbuilders building AppLab widgets in start mode to access Applab as usual.
    # Everywhere else, widgets should be treated as embedded levels.
    treat_widget_as_embed = level_options['widgetMode'] && !@is_start_mode

    # Process level view options
    level_overrides = level_view_options(@level.id).dup
    level_options['embed'] = level_options['embed'] || treat_widget_as_embed
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

    # Expo-specific options (only needed for Applab and Gamelab)
    if (@level.is_a? Gamelab) || (@level.is_a? Applab)
      app_options[:expoSession] = CDO.expo_session_secret.to_json unless CDO.expo_session_secret.blank?
    end

    # User/session-dependent options
    app_options[:disableSocialShare] = true if (current_user && current_user.under_13?) || app_options[:embed]
    app_options[:legacyShareStyle] = true if @legacy_share_style
    app_options[:isMobile] = true if browser.mobile?
    app_options[:labUserId] = lab_user_id if @game == Game.applab || @game == Game.gamelab
    app_options.merge!(firebase_options)
    app_options[:canResetAbuse] = true if current_user && current_user.permission?(UserPermission::PROJECT_VALIDATOR)
    app_options[:isSignedIn] = !current_user.nil?
    app_options[:isTooYoung] = !current_user.nil? && current_user.under_13? && current_user.terms_version.nil?
    app_options[:pinWorkspaceToBottom] = true if l.enable_scrolling?
    app_options[:hasVerticalScrollbars] = true if l.enable_scrolling?
    app_options[:showExampleTestButtons] = true if l.enable_examples?
    app_options[:report] = {
      fallback_response: @fallback_response,
      callback: @callback,
      sublevelCallback: @sublevel_callback,
    }
    dev_with_credentials = rack_env?(:development) && !!CDO.cloudfront_key_pair_id
    use_restricted_songs = CDO.cdn_enabled || dev_with_credentials || (rack_env?(:test) && ENV['CI'])
    app_options[:useRestrictedSongs] = use_restricted_songs if @game == Game.dance
    app_options[:isStartMode] = @is_start_mode || false

    if params[:blocks]
      level_options[:sharedBlocks] = Block.for(*params[:blocks].split(','))
      level_options[:sharedFunctions] = nil # TODO: handle non-standard pools
    end

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
    if request
      app_options[:isUS] = request.location.try(:country_code) == 'US' ||
          (!Rails.env.production? && request.location.try(:country_code) == 'RD')
    end
    app_options[:send_to_phone_url] = send_to_phone_url if app_options[:isUS]

    if (@game && @game.owns_footer_for_share?) || @legacy_share_style
      app_options[:copyrightStrings] = build_copyright_strings
    end

    app_options
  end

  def build_copyright_strings
    # These would ideally also go in _javascript_strings.html right now, but it can't
    # deal with params.
    {
      thank_you: URI.escape(I18n.t('footer.thank_you')),
      help_from_html: I18n.t('footer.help_from_html'),
      art_from_html: URI.escape(I18n.t('footer.art_from_html', current_year: Time.now.year)),
      code_from_html: URI.escape(I18n.t('footer.code_from_html')),
      powered_by_aws: I18n.t('footer.powered_by_aws'),
      trademark: URI.escape(I18n.t('footer.trademark', current_year: Time.now.year)),
      built_on_github: I18n.t('footer.built_on_github'),
      google_copyright: URI.escape(I18n.t('footer.google_copyright'))
    }
  end

  def match_answer_as_image(path, width)
    attrs = {src: path.strip}
    attrs[:width] = width.strip if width
    content_tag(:img, '', attrs)
  end

  def match_answer_as_embedded_blockly(path)
    # '.start_blocks' takes the XML from the start_blocks of the specified level.
    ext = File.extname(path)
    base_level = File.basename(path, ext)
    level = Level.find_by(name: base_level)
    block_type = ext.slice(1..-1)
    options = {
      readonly: true,
      embedded: true,
      locale: js_locale,
      baseUrl: Blockly.base_url,
      blocks: '<xml></xml>',
      dialog: {},
      nonGlobal: true,
    }
    app = level.game.app
    blocks = content_tag(:xml, level.blocks_to_embed(level.properties[block_type]).html_safe)

    unless @blockly_loaded
      @blockly_loaded = true
      blocks = blocks + content_tag(:div, '', {id: 'codeWorkspace', style: 'display: none'}) +
      content_tag(:style, '.blocklySvg { background: none; }') +
      content_tag(:script, '', src: webpack_asset_path('js/blockly.js')) +
      content_tag(:script, '', src: webpack_asset_path("js/#{js_locale}/blockly_locale.js")) +
      content_tag(:script, '', src: webpack_asset_path('js/common.js')) +
      content_tag(:script, '', src: webpack_asset_path("js/#{js_locale}/#{app}_locale.js")) +
      content_tag(:script, '', src: webpack_asset_path("js/#{app}.js"), 'data-appoptions': options.to_json) +
      content_tag(:script, '', src: webpack_asset_path('js/embedBlocks.js'))
    end

    blocks
  end

  def match_answer_as_iframe(path, width)
    base_level = File.basename(path, '.level')
    level = Level.find_by(name: base_level)
    content_tag(
      :div,
      content_tag(
        :iframe,
        '',
        {
          src: url_for(id: level.id, controller: :levels, action: :embed_level).strip,
          width: (width ? width.strip : '100%'),
          scrolling: 'no',
          seamless: 'seamless',
          style: 'border: none;'
        }
      ),
      {class: 'aspect-ratio'}
    )
  end

  def render_multi_or_match_content(text)
    return unless text

    path, width = text.split(',')
    return match_answer_as_image(path, width) if %w(.jpg .png .gif).include? File.extname(path).downcase
    return match_answer_as_embedded_blockly(path) if File.extname(path).ends_with? '_blocks'
    return match_answer_as_iframe(path, width) if File.extname(path) == '.level'

    @@markdown_renderer ||= Redcarpet::Markdown.new(Redcarpet::Render::Inline.new(filter_html: true))
    @@markdown_renderer.render(text).html_safe
  end

  def level_title
    if @script_level
      script =
        if @script_level.script.flappy?
          data_t 'game.name', @game.name
        else
          data_t_suffix 'script.name', @script_level.script.name, 'title'
        end
      lesson = @script_level.name
      position = @script_level.position
      if @script_level.script.lessons.many?
        "#{script}: #{lesson} ##{position}"
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
    Video.distinct.pluck(:key)
  end

  # Constructs pairs of [filename, asset path] for a dropdown menu of available ani-gifs
  def instruction_gif_choices
    all_filenames = Dir.chdir(Rails.root.join('config', 'scripts', instruction_gif_relative_path)) {Dir.glob(File.join("**", "*"))}
    all_filenames.map {|filename| [filename, instruction_gif_asset_path(filename)]}
  end

  def instruction_gif_asset_path(filename)
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

  def session_id
    # session.id may not be available on the first visit unless we write to the session first.
    session['init'] = true
    session.id.to_s
  end

  def user_or_session_id
    current_user ? current_user.id.to_s : session_id
  end

  # Unique, consistent ID for a user of an *lab app.
  def lab_user_id
    plaintext_id = "#{@view_options[:channel]}:#{user_or_session_id}"
    Digest::SHA1.base64digest(storage_encrypt(plaintext_id)).tr('=', '')
  end

  # Assign a firebase authentication token based on the firebase shared secret,
  # plus either the dashboard user id or the rails session id. This is
  # sufficient for rate limiting, since it uniquely identifies users.
  #
  # Today, anyone can edit the data in any channel, so this meets our current needs.
  # In the future, if we need to assign special privileges to channel owners,
  # we could include the storage_id associated with the user id (if one exists).
  def firebase_shared_auth_token
    return nil unless CDO.firebase_shared_secret

    base_channel = params[:channel_id] || get_channel_for(@level, @user)
    payload = {
      uid: user_or_session_id,
      is_dashboard_user: !!current_user,
      channel: "#{base_channel}#{CDO.firebase_channel_id_suffix}"
    }
    options = {}
    # Provides additional debugging information to the browser when
    # security rules are evaluated.
    options[:debug] = true if CDO.firebase_debug && CDO.rack_env?(:development)

    # TODO(dave): cache token generator across requests
    generator = Firebase::FirebaseTokenGenerator.new(CDO.firebase_shared_secret)
    generator.create_token(payload, options)
  end

  # Assign a firebase authentication token based on the firebase secret,
  # plus either the dashboard user id or the rails session id. This is
  # sufficient for rate limiting, since it uniquely identifies users.
  #
  # Today, anyone can edit the data in any channel, so this meets our current needs.
  # In the future, if we need to assign special privileges to channel owners,
  # we could include the storage_id associated with the user id (if one exists).
  def firebase_auth_token
    return nil unless CDO.firebase_secret

    base_channel = params[:channel_id] || get_channel_for(@level, @user)
    payload = {
      uid: user_or_session_id,
      is_dashboard_user: !!current_user,
      channel: "#{base_channel}#{CDO.firebase_channel_id_suffix}"
    }
    options = {}
    # Provides additional debugging information to the browser when
    # security rules are evaluated.
    options[:debug] = true if CDO.firebase_debug && CDO.rack_env?(:development)

    # TODO(dave): cache token generator across requests
    generator = Firebase::FirebaseTokenGenerator.new(CDO.firebase_secret)
    generator.create_token(payload, options)
  end

  # If this is a restricted level (i.e., applab), the user is under 13, and the
  # user has no teacher that has accepted our (August 2016) terms of service,
  # redirect with a flash alert.
  # Also redirect if the user is pairing with a user who would receive a
  # redirect.
  # @return [boolean] whether a (privacy) redirect happens.
  def redirect_under_13_without_tos_teacher(level)
    # Note that Game.applab includes both App Lab and Maker Toolkit.
    return false unless level.game == Game.applab || level.game == Game.gamelab || level.game == Game.weblab

    if current_user && current_user.under_13? && current_user.terms_version.nil?
      if current_user.teachers.any?
        error_message = I18n.t("errors.messages.teacher_must_accept_terms")
      else
        error_message = I18n.t("errors.messages.too_young")
        FirehoseClient.instance.put_record(
          :analysis,
          {
            study: "redirect_under_13",
            event: "student_with_no_teacher_redirected",
            user_id: current_user.id,
            data_json: {
              game: level.game.name
            }.to_json
          }
        )
      end
      redirect_to '/', flash: {alert: error_message}
      return true
    end

    pairings.each do |paired_user|
      if paired_user.under_13? && paired_user.terms_version.nil?
        redirect_to '/', flash: {alert: I18n.t("errors.messages.pair_programmer")}
        return true
      end
    end

    false
  end

  def can_view_solution?
    if current_user && @level.try(:ideal_level_source_id) && @script_level && !@script.hide_solutions? && @level.contained_levels.empty?
      Ability.new(current_user).can? :view_level_solutions, @script
    end
  end

  def can_view_teacher_markdown?
    if current_user.try(:authorized_teacher?)
      true
    elsif current_user.try(:teacher?) && @script
      @script.k5_course? || @script.k5_draft_course?
    else
      false
    end
  end

  # Should the multi calling on this helper function include answers to be rendered into the client?
  # Caller indicates whether the level is standalone or not.
  def include_multi_answers?(standalone)
    standalone || Policies::InlineAnswer.visible?(current_user, @script_level)
  end

  # Finds the existing LevelSourceImage corresponding to the specified level
  # source id if one exists, otherwise creates and returns a new
  # LevelSourceImage using the image data in level_image.
  #
  # @param level_image [String] A base64-encoded image.
  # @param level_source [LevelSource, nil] LevelSource or nil.
  # @param upgrade [Boolean] Whether to replace the saved image if level_image
  #   is higher resolution
  # @returns [LevelSourceImage] A level source image, or nil if one was not
  # created or found.
  def find_or_create_level_source_image(level_image, level_source, upgrade=false)
    level_source_image = nil
    # Store the image only if the image is set, and either the image has not been
    # saved or the saved image is smaller than the provided image
    if level_image && level_source
      level_source_image = LevelSourceImage.find_by(level_source: level_source)
      upgradable = false
      if upgrade && level_source_image
        old_image_size = ImageSize.path(level_source_image.s3_url)
        new_image_size = ImageSize.new(Base64.decode64(level_image))
        upgradable = new_image_size.width > old_image_size.width &&
          new_image_size.height > old_image_size.height
      end
      if !level_source_image || upgradable
        level_source_image = LevelSourceImage.new(level_source: level_source)
        unless level_source_image.save_to_s3(Base64.decode64(level_image))
          level_source_image = nil
        end
      end
    end
    level_source_image
  end

  # Returns the appropriate POST_MILESTONE_MODE enum based on the values
  # of postMilestone and postFailedRunMilestone
  #
  # @param post_milestone [boolean] gatekeeper value
  # @param post_failed_run_milestone [boolean] gatekeeper value
  # @returns [POST_MILESTONE_MODE] enum value
  def post_milestone_mode(post_milestone, post_failed_run_milestone)
    if post_milestone
      return POST_MILESTONE_MODE.successful_runs_and_final_level_only unless post_failed_run_milestone
      POST_MILESTONE_MODE.all
    else
      POST_MILESTONE_MODE.final_level_only
    end
  end
end
