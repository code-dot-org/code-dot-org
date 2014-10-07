module LevelsHelper

  def build_script_level_path(script_level)
    case script_level.script_id
    when Script::HOC_ID
      hoc_chapter_path(script_level.chapter)
    when Script::TWENTY_HOUR_ID
      script_level_path(script_level.script, script_level)
    when Script::EDIT_CODE_ID
      editcode_chapter_path(script_level.chapter)
    when Script::TWENTY_FOURTEEN_LEVELS_ID
      twenty_fourteen_chapter_path(script_level.chapter)
    when Script::BUILDER_ID
      builder_chapter_path(script_level.chapter)
    when Script::FLAPPY_ID
      flappy_chapter_path(script_level.chapter)
    when Script::JIGSAW_ID
      jigsaw_chapter_path(script_level.chapter)
    else
      if script_level.stage
        script_stage_script_level_path(script_level.script, script_level.stage, script_level.position)
      else
        script_puzzle_path(script_level.script, script_level.chapter)
      end
    end
  end

  def build_script_level_url(script_level)
    url_from_path(build_script_level_path(script_level))
  end

  def url_from_path(path)
    "#{root_url.chomp('/')}#{path}"
  end

  def set_videos_and_blocks_and_callouts
    select_and_track_autoplay_video

    if @level.is_a? Blockly
      @toolbox_blocks = @toolbox_blocks || @level.toolbox_blocks
      @start_blocks = initial_blocks(current_user, @level) || @start_blocks || @level.start_blocks
    end

    select_and_remember_callouts if @script_level
  end

  def select_and_track_autoplay_video
    seen_videos = session[:videos_seen] || Set.new
    autoplay_video = nil

    is_legacy_level = @script_level && @script_level.script.legacy_curriculum?

    if is_legacy_level
      autoplay_video = @level.related_videos.find { |video| !seen_videos.include?(video.key) }
    elsif @level.is_a?(Blockly) && @level.specified_autoplay_video
      unless seen_videos.include?(@level.specified_autoplay_video.key)
        autoplay_video = @level.specified_autoplay_video
      end
    end

    return unless autoplay_video

    seen_videos.add(autoplay_video.key)
    session[:videos_seen] = seen_videos
    @autoplay_video_info = video_info(autoplay_video) unless params[:noautoplay]
  end

  def select_and_remember_callouts
    session[:callouts_seen] ||= Set.new()
    @callouts_to_show = Callout.where(script_level: @script_level)
      .select(:id, :element_id, :qtip_config, :localization_key)
      .reject { |c| session[:callouts_seen].include?(c.localization_key) }
      .each { |c| session[:callouts_seen].add(c.localization_key) }
    @callouts = make_localized_hash_of_callouts(@callouts_to_show)
  end

  def make_localized_hash_of_callouts(callouts)
    callouts.map do |callout|
      callout_hash = callout.attributes
      callout_hash.delete('localization_key')
      callout_hash['localized_text'] = data_t('callout.text', callout.localization_key)
      callout_hash
    end
  end

  # this defines which levels should be seeded with th last result from a different level
  def initial_blocks(user, level)
    if params[:initial_code]
      return params[:initial_code]
    end

    if user
      if level.game.app == 'turtle'
        from_level_num = case level.level_num
          when '3_8' then '3_7'
          when '3_9' then '3_8'
        end

        if from_level_num
          from_level = Level.find_by_game_id_and_level_num(level.game_id, from_level_num)
          return user.last_attempt(from_level).try(:level_source).try(:data)
        end
      end
    end
    nil
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

  # Code for generating the blockly options hash
  def blockly_options(local_assigns={})
    # Use values from properties json when available (use String keys instead of Symbols for consistency)
    level = @level.properties.dup || {}

    # Set some specific values
    level['puzzle_number'] = @script_level ? @script_level.stage_or_game_position : 1
    level['stage_total'] = @script_level ? @script_level.stage_or_game_total : @level.game.levels.count
    if @level.is_a?(Blockly) && @level.step_mode
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
      artist_builder:builder
      ani_gif_url:aniGifURL
      images
      free_play
      min_workspace_height
      slider_speed
      permitted_errors
      disable_param_editing
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
      free_play
    ).map{ |x| x.include?(':') ? x.split(':') : [x,x.camelize(:lower)]}]
    .each do |dashboard, blockly|
      # Select first valid value from 1. local_assigns, 2. property of @level object, 3. named instance variable, 4. properties json
      # Don't override existing valid (non-nil/empty) values
      property = local_assigns[dashboard].presence ||
        @level[dashboard].presence ||
        instance_variable_get("@#{dashboard}").presence ||
        level[dashboard.to_s].presence
      level[blockly.to_s] ||= blockly_value(property) if property.present?
    end

    level['images'] = JSON.parse(level['images']) if level['images'].present?

    # Blockly requires startDirection as an integer not a string
    level['startDirection'] = level['startDirection'].to_i if level['startDirection'].present?
    level['sliderSpeed'] = level['sliderSpeed'].to_f if level['sliderSpeed']
    level['scale'] = {'stepSpeed' =>  @level.properties['step_speed'].to_i } if @level.properties['step_speed'].present?

    # Blockly requires these fields to be objects not strings
    %w(map initialDirt finalDirt goal soft_buttons).each do |x|
      level[x] = JSON.parse(level[x]) if level[x].is_a? String
    end

    # Blockly expects fn_successCondition and fn_failureCondition to be inside a 'goals' object
    level['goal'] = {fn_successCondition: level['fn_successCondition'], fn_failureCondition: level['fn_failureCondition']}
    level.delete('fn_successCondition')
    level.delete('fn_failureCondition')

    # Fetch localized strings
    %w(instructions).each do |label|
      val = [@level.game.app, @level.game.name].map { |name|
        data_t("level.#{label}", "#{name}_#{@level.level_num}")
      }.compact.first
      level[label] ||= val unless val.nil?
    end

    # Set some values that Blockly expects on the root of its options string
    app_options = {'levelId' => @level.level_num}
    app_options['scriptId'] = @script.id if @script
    app_options['levelGameName'] = @level.game.name if @level.game
    app_options['scrollbars'] = blockly_value(@level.scrollbars) if @level.is_a?(Blockly) && @level.scrollbars
    [level, app_options]
  end

  def string_or_image(prefix, text)
    path, width = text.split(',') if text
    if ['.jpg', '.png', '.gif'].include? File.extname(path)
      if width
        "<img src='" + path.strip + "' width='" + width.strip + "'></img>"
      else
        "<img src='" + path.strip + "'></img>"
      end
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
    if (script = @script_level.try(:script)) && !(script.default_script?)
      "#{data_t_suffix('script.name', script.name, 'title')}: #{@script_level.name} ##{@script_level.stage_or_game_position}"
    else
      level_num = "##{@script_level.try(:game_chapter) || @level.level_num} " unless @game.name == "Flappy" and @level.level_num == "1"
      "#{data_t('game.name', @game.name)} #{level_num}"
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
end
