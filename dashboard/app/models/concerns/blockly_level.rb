# Model Concern for functionality specific to bridging between the Level model and Blockly's level options object.
module BlocklyLevel
  extend ActiveSupport::Concern
  included do
    # Return a Blockly-formatted 'appOptions' hash derived from the level contents
    def blockly_options
      Rails.cache.fetch("#{cache_key}/blockly_level_options") do
        level = self
        # Use values from properties json when available (use String keys instead of Symbols for consistency)
        level_prop = level.properties.dup || {}

        # Set some specific values

        if level.is_a? Blockly
          level_prop['start_blocks'] = level.try(:project_template_level).try(:start_blocks) || level.start_blocks
          level_prop['toolbox_blocks'] = level.try(:project_template_level).try(:toolbox_blocks) || level.toolbox_blocks
          level_prop['code_functions'] = level.try(:project_template_level).try(:code_functions) || level.code_functions
        end

        if level.is_a?(Maze) && level.step_mode
          step_mode = level.class.blockly_value(level.step_mode)
          level_prop['step'] = step_mode == 1 || step_mode == 2
          level_prop['stepOnly'] = step_mode == 2
        end

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
          # Select value from properties json
          # Don't override existing valid (non-nil/empty) values
          property = level_prop[dashboard].presence
          value = level.class.blockly_value(level_prop[blockly] || property)
          level_prop[blockly] = value unless value.nil? # make sure we convert false
        end

        level_prop['images'] = JSON.parse(level_prop['images']) if level_prop['images'].present?

        # Blockly requires startDirection as an integer not a string
        level_prop['startDirection'] = level_prop['startDirection'].to_i if level_prop['startDirection'].present?
        level_prop['sliderSpeed'] = level_prop['sliderSpeed'].to_f if level_prop['sliderSpeed']
        level_prop['scale'] = {'stepSpeed' => level_prop['step_speed'].to_i} if level_prop['step_speed'].present?

        # Blockly requires these fields to be objects not strings
        (
        %w(map initialDirt finalDirt goal soft_buttons inputOutputTable)
          .concat NetSim.json_object_attrs
        ).each do |x|
          level_prop[x] = JSON.parse(level_prop[x]) if level_prop[x].is_a? String
        end

        # Blockly expects fn_successCondition and fn_failureCondition to be inside a 'goals' object
        if level_prop['fn_successCondition'] || level_prop['fn_failureCondition']
          level_prop['goal'] = {fn_successCondition: level_prop['fn_successCondition'], fn_failureCondition: level_prop['fn_failureCondition']}
          level_prop.delete('fn_successCondition')
          level_prop.delete('fn_failureCondition')
        end

        app_options = {}

        app_options[:levelGameName] = level.game.name if level.game
        app_options[:skinId] = level.skin if level.is_a?(Blockly)

        # Set some values that Blockly expects on the root of its options string
        app_options.merge!({
            baseUrl: "#{ActionController::Base.asset_host}/blockly/",
            app: level.game.try(:app),
            levelId: level.level_num,
            level: level_prop,
            cacheBust: level.class.blockly_cache_bust,
            droplet: level.game.try(:uses_droplet?),
            pretty: Rails.configuration.pretty_apps ? '' : '.min',
          })

        app_options
      end
    end
  end
  module ClassMethods
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
      'true'
    end

    def boolean_string_false
      'false'
    end
  end
end
