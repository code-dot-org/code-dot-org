require "csv"
require "naturally"
require 'cdo/firehose'

EMPTY_XML = '<xml></xml>'.freeze

class LevelsController < ApplicationController
  include LevelsHelper
  include ActiveSupport::Inflector
  before_action :authenticate_user!, except: [:show, :level_properties, :embed_level, :get_rubric, :get_serialized_maze]
  before_action :require_levelbuilder_mode_or_test_env, except: [:show, :level_properties, :embed_level, :get_rubric, :get_serialized_maze, :extra_links]
  load_and_authorize_resource except: [:create]

  before_action :set_level, only: [:show, :edit, :update, :destroy]

  LEVELS_PER_PAGE = 30

  # All level types that can be requested via /levels/new
  LEVEL_CLASSES = [
    Aichat,
    Ailab,
    Applab,
    Artist,
    Bounce,
    BubbleChoice,
    Craft,
    CurriculumReference,
    Dancelab,
    EvaluationMulti,
    External,
    ExternalLink,
    Fish,
    Flappy,
    FreeResponse,
    FrequencyAnalysis,
    Gamelab,
    GamelabJr,
    Javalab,
    Karel,
    LevelGroup,
    Map,
    Match,
    Maze,
    Multi,
    Music,
    NetSim,
    Odometer,
    Panels,
    Pixelation,
    Poetry,
    PublicKeyCryptography,
    Pythonlab,
    StandaloneVideo,
    StarWarsGrid,
    Studio,
    TextCompression,
    TextMatch,
    Unplugged,
    Vigenere,
    Weblab,
    Weblab2
  ]

  # GET /levels
  # GET /levels.json
  def index
    # Define search filter fields

    search_options = Level.search_options
    @search_fields = [
      {
        name: :name,
        description: 'Filter by name:',
        type: 'text'
      },
      {
        name: :level_type,
        description: 'By type:',
        type: 'select',
        options: search_options[:levelOptions]
      },
      {
        name: :script_id,
        description: 'By script:',
        type: 'select',
        options: search_options[:scriptOptions]
      },
      {
        name: :owner_id,
        description: 'By owner:',
        type: 'select',
        options: search_options[:ownerOptions]
      }
    ]

    filter_levels(params)
    @levels = @levels.page(params[:page]).per(LEVELS_PER_PAGE)
  end

  # GET /levels/get_filtered_levels/
  # Get all the information for levels after filtering
  def get_filtered_levels
    if params[:name]&.start_with?('blockly:')
      @levels = [Level.find_by_key(params[:name]).summarize_for_edit]
      return render json: {numPages: 1, levels: @levels}
    end
    filter_levels(params)

    @levels = @levels.limit(150)
    total_levels = @levels.length
    page_number = (total_levels / 7.0).ceil

    @levels = @levels.page(params[:page]).per(7)
    @levels = @levels.map(&:summarize_for_edit)
    render json: {numPages: page_number, levels: @levels}
  end

  def filter_levels(params)
    # Gather filtered search results
    @levels = @levels.order(updated_at: :desc)
    @levels = @levels.where('levels.name LIKE ?', "%#{params[:name]}%").or(@levels.where('levels.level_num LIKE ?', "%#{params[:name]}%")) if params[:name]
    @levels = @levels.where(levels: {type: params[:level_type]}) if params[:level_type].present?
    @levels = @levels.joins(:script_levels).where(script_levels: {script_id: params[:script_id]}) if params[:script_id].present?
    @levels = @levels.left_joins(:user).where(levels: {user_id: params[:owner_id]}) if params[:owner_id].present?
  end

  # GET /levels/1
  # GET /levels/1.json
  def show
    if @level.try(:pages)
      @pages = @level.pages
      @total_level_count = @level.levels.length
    end

    view_options(
      full_width: true,
      no_footer: @game&.no_footer?,
      small_footer: @game&.uses_small_footer? || @level&.enable_scrolling?,
      has_i18n: @game.has_i18n?,
      blocklyVersion: params[:blocklyVersion]
    )
  end

  # Get a JSON summary of a level's properties, used in modern labs that don't
  # reload the page between level views.
  def level_properties
    render json: @level.summarize_for_lab2_properties(nil, nil, current_user)
  end

  # GET /levels/1/edit
  def edit
    # Make sure that the encrypted property is a boolean
    if @level.properties['encrypted'].is_a?(String)
      @level.properties['encrypted'] = @level.properties['encrypted'].to_bool
    end
    bubble_choice_parents = BubbleChoice.parent_levels(@level.name)
    any_parent_in_script = bubble_choice_parents.any? {|pl| pl.script_levels.any?}
    @in_script = @level.script_levels.any? || any_parent_in_script
    @standalone = ProjectsController::STANDALONE_PROJECTS.values.map {|h| h[:name]}.include?(@level.name)
    if @level.is_a? Applab
      @dataset_library_manifest = DatablockStorageLibraryManifest.instance.library_manifest
    end
  end

  use_reader_connection_for_route(:get_rubric)

  # GET /levels/:id/get_rubric
  # Get all the information for the mini rubric
  def get_rubric
    return head :no_content unless @level.mini_rubric&.to_bool
    render json: {
      keyConcept: @level.localized_rubric_property('rubric_key_concept'),
      performanceLevel1: @level.localized_rubric_property('rubric_performance_level_1'),
      performanceLevel2: @level.localized_rubric_property('rubric_performance_level_2'),
      performanceLevel3: @level.localized_rubric_property('rubric_performance_level_3'),
      performanceLevel4: @level.localized_rubric_property('rubric_performance_level_4')
    }
  end

  # GET /levels/:id/get_serialized_maze
  # Get the serialized_maze for the level, if it exists.
  def get_serialized_maze
    serialized_maze = @level.try(:get_serialized_maze)
    return head :no_content unless serialized_maze
    render json: serialized_maze
  end

  # GET /levels/:id/edit_blocks/:type
  # Action for using blockly workspace as a toolbox/startblock editor.
  # Expects params[:type] which can be either 'toolbox_blocks' or 'start_blocks'
  # Javalab also uses this route to edit starter code, and sets the type param
  # to 'start_sources'
  def edit_blocks
    type = params[:type]
    blocks_xml = @level.properties[type].presence || @level[type] || EMPTY_XML

    blocks_xml = Blockly.convert_category_to_toolbox(blocks_xml) if type == 'toolbox_blocks'

    # By default, allow levels to define their own toolboxes for all
    # types
    toolbox_blocks = @level.complete_toolbox(type)

    # Levels which support (and have )solution blocks use those blocks
    # as the toolbox for required and recommended block editors, plus
    # the special "pick one" block
    can_use_solution_blocks = @level.respond_to?(:get_solution_blocks) &&
      @level.properties['solution_blocks']
    should_use_solution_blocks = ['required_blocks', 'recommended_blocks'].include?(type)
    if can_use_solution_blocks && should_use_solution_blocks
      blocks = @level.get_solution_blocks + ["<block type=\"pick_one\"></block>"]
      toolbox_blocks = "<xml>#{blocks.join}</xml>"
    end

    validation = @level.respond_to?(:validation) ? @level.validation : nil

    level_view_options(
      @level.id,
      start_blocks: blocks_xml,
      toolbox_blocks: toolbox_blocks,
      edit_blocks: type,
      skip_instructions_popup: true,
      validation: validation
    )
    view_options(full_width: true)
    @game = @level.game
    @callback = update_blocks_level_path @level, type

    # Ensure the simulation ends right away when the user clicks 'Run' while editing blocks
    if @level.is_a? Studio
      level_view_options(
        @level.id,
        success_condition: 'function () { return true; }'
      )
    end

    @is_start_mode = type == 'start_blocks'

    show
    render :show
  end

  # GET /levels/:id/edit_exemplar
  def edit_exemplar
    @game = @level.game
    @is_editing_exemplar = true

    exemplar_sources = @level.try(:exemplar_sources)
    level_view_options(@level.id, {is_editing_exemplar: true, exemplar_sources: exemplar_sources})

    show
    render :show
  end

  # POST /levels/:id/update_blocks/:type
  # Change a blockset in the level configuration
  def update_blocks
    return head :forbidden unless @level.custom?
    blocks_xml = params[:program]
    type = params[:type]
    set_solution_image_url(@level) if type == 'solution_blocks'
    blocks_xml = Blockly.remove_counter_mutations(blocks_xml)
    blocks_xml = Blockly.convert_toolbox_to_category(blocks_xml) if type == 'toolbox_blocks'
    @level.properties[type] = blocks_xml
    @level.log_changes(current_user)
    @level.save!
    render json: {redirect: level_url(@level)}
  end

  def update_properties(ignored_keys: [])
    changes = JSON.parse(request.body.read)
    changes.each do |key, value|
      next if ignored_keys.include?(key)
      @level.properties[key] = value
    end

    @level.log_changes(current_user)
    @level.save!

    render json: {redirect: level_url(@level)}
  end

  # PATCH/PUT /levels/1
  # PATCH/PUT /levels/1.json
  def update
    if level_params[:name] &&
        @level.name != level_params[:name] &&
        @level.name.casecmp?(level_params[:name])
      # do not allow case-only changes in the level name because that confuses git on OSX
      @level.errors.add(:name, 'Cannot change only the capitalization of the level name (it confuses git on OSX)')
      log_save_error(@level)
      render json: @level.errors, status: :unprocessable_entity
      return
    end

    update_level_params = level_params.to_h
    handle_json_params(update_level_params)

    @level.assign_attributes(update_level_params)
    @level.log_changes(current_user)

    if @level.save
      reset = !!params[:reset]
      go_to_start = !!params[:go_to_start]
      redirect = if go_to_start
                   edit_blocks_level_path(@level, :start_sources)
                 else
                   if reset
                     params["redirect"] || level_url(@level, show_callouts: 1, reset: reset)
                   else
                     params["redirect"] || level_url(@level, show_callouts: 1)
                   end
                 end
      render json: {redirect: redirect}
    else
      log_save_error(@level)
      render json: @level.errors, status: :unprocessable_entity
    end
  rescue ArgumentError, ActiveRecord::RecordInvalid => exception
    render status: :not_acceptable, plain: exception.message
  end

  # POST /levels/:id/update_start_code
  # Update start code for a level. If params contains "validation",
  # set validation directly to ensure it is encrypted.
  # Then set any remaining properties with update_properties.
  def update_start_code
    changes = JSON.parse(request.body.read)
    if @level.respond_to?(:validation)
      @level.validation = changes["validation"]
    end
    return update_properties(ignored_keys: ["validation"])
  end

  # POST /levels/:id/update_exemplar_code
  def update_exemplar_code
    changes = JSON.parse(request.body.read)
    if @level.respond_to?(:exemplar_sources)
      @level.exemplar_sources = changes["exemplar_sources"]
    end

    @level.log_changes(current_user)
    @level.save!

    # We tend to respond with a redirect URL in this controller,
    # but it is not used in this case.
    render json: {redirect: level_url(@level)}
  end

  # POST /levels
  # POST /levels.json
  def create
    authorize! :create, Level
    type_class = level_params[:type].constantize

    # Set some defaults.
    params[:level][:skin] ||= type_class.skins.first if type_class <= Blockly
    if type_class <= Grid
      default_tile = type_class == Karel ? {tileType: 0} : 0
      start_tile = type_class == Karel ? {tileType: 2} : 2
      params[:level][:maze_data] = Array.new(8) {Array.new(8) {default_tile}}
      params[:level][:maze_data][0][0] = start_tile
    end
    if type_class <= Studio
      params[:level][:maze_data][0][0] = 16 # studio must have at least 1 actor
      params[:level][:soft_buttons] = nil
      params[:level][:timeout_after_when_run] = true
      params[:level][:success_condition] = Studio.default_success_condition
      params[:level][:failure_condition] = Studio.default_failure_condition
    end
    params[:level][:maze_data] = params[:level][:maze_data].to_json if type_class <= Grid
    params[:user] = current_user

    # safely convert params to hash now so that if they are modified later, it
    # will not result in a ActionController::UnfilteredParameters error.
    create_level_params = level_params.to_h
    handle_json_params(create_level_params)

    # Give platformization partners permission to edit any levels they create.
    editor_experiment = Experiment.get_editor_experiment(current_user)
    create_level_params[:editor_experiment] = editor_experiment if editor_experiment

    begin
      @level = type_class.create_from_level_builder(params, create_level_params)
    rescue ArgumentError => exception
      render(status: :not_acceptable, plain: exception.message) && return
    rescue ActiveRecord::RecordInvalid => exception
      render(status: :not_acceptable, plain: exception) && return
    end
    if params[:go_to_start]
      render json: {redirect: edit_blocks_level_path(@level, :start_sources)}
    elsif params[:do_not_redirect]
      render json: @level
    else
      render json: {redirect: edit_level_path(@level)}
    end
  end

  # DELETE /levels/1
  # DELETE /levels/1.json
  def destroy
    result = @level.destroy
    if request.format.symbol == :json
      if result
        return render json: {redirect: levels_url}
      else
        return render status: :unprocessable_entity, plain: "Could not delete. Error(s): #{@level.errors.full_messages.join('. ')}"
      end
    else
      if result
        flash.notice = "Deleted #{@level.name.inspect}"
        redirect_to(params[:redirect] || levels_url)
      else
        flash.alert = @level.errors.full_messages.join(". ")
        redirect_to(edit_level_path(@level))
      end
    end
  end

  def new
    authorize! :create, Level
    if params.key? :type
      @type_class = LEVEL_CLASSES.find {|klass| klass.name == params[:type]}
      raise "Level type '#{params[:type]}' not permitted" unless @type_class
      if @type_class == Artist
        @game = Game.custom_artist
      elsif @type_class <= Studio
        @game = Game.custom_studio
      elsif @type_class <= Applab
        @game = Game.applab
      elsif @type_class <= Gamelab
        @game = Game.gamelab
      elsif @type_class <= Maze
        @game = Game.custom_maze
      elsif @type_class <= DSLDefined
        @game = Game.find_by(name: @type_class.to_s)
      elsif @type_class == NetSim
        @game = Game.netsim
      elsif @type_class == Craft
        @game = Game.craft
      elsif @type_class == Weblab
        @game = Game.weblab
      elsif @type_class == Fish
        @game = Game.fish
      elsif @type_class == CurriculumReference
        @game = Game.curriculum_reference
      elsif @type_class <= Ailab
        @game = Game.ailab
      elsif @type_class == Javalab
        @game = Game.javalab
      elsif @type_class == Music
        @game = Game.music
      elsif @type_class == Aichat
        @game = Game.aichat
      elsif @type_class == Pythonlab
        @game = Game.pythonlab
      elsif @type_class == Panels
        @game = Game.panels
      elsif @type_class == Weblab2
        @game = Game.weblab2
      end
      @level = @type_class.new
      render :edit
    else
      @levels = Naturally.sort_by(Level.where(user: current_user), :name)
    end
  end

  # POST /levels/1/clone?name=new_name
  # Clone existing level and open edit page
  def clone
    new_name = params.require(:name)
    editor_experiment = Experiment.get_editor_experiment(current_user)
    @new_level = @level.clone_with_name(new_name, editor_experiment: editor_experiment)

    if params[:do_not_redirect]
      render json: @new_level
    else
      render json: {redirect: edit_level_url(@new_level)}
    end
  rescue ArgumentError => exception
    render(status: :not_acceptable, plain: exception.message)
  rescue ActiveRecord::RecordInvalid => exception
    render(status: :not_acceptable, plain: exception)
  end

  # GET /levels/:id/embed_level
  # Show level styles for embedding in another page
  def embed_level
    @game = @level.game
    level_view_options(
      @level.id,
      embed: true,
      share: false,
      skip_instructions_popup: true
    )
    view_options(full_width: true)
    render 'levels/show'
  end

  # GET /levels/:id/extra_links
  # Get the "extra links" for the level, for use by levelbuilders and project validators.
  # Project validators can view a subset of the links/information.
  # This is used by lab2 levels that cannot use the haml "extra links" box
  # as that box will not refresh when changing levels.
  def extra_links
    links = {}

    links[@level.name] = [{text: level_path(@level), url: level_url(@level)}]
    if @level.level_concept_difficulty && !@level.level_concept_difficulty.concept_difficulties_as_string.empty?
      links[@level.name] << {text: "LCD: #{@level.level_concept_difficulty.concept_difficulties_as_string}", url: ''}
    end
    is_standalone_project = ProjectsController::STANDALONE_PROJECTS.values.map {|h| h[:name]}.include?(@level.name)
    # Curriculum writers rarely need to edit STANDALONE_PROJECTS levels, and accidental edits to these levels
    # can be quite disruptive. As a workaround you can navigate directly to the edit url for these levels.
    if Rails.application.config.levelbuilder_mode && !is_standalone_project
      can_edit_level = can? :edit, @level
      if can_edit_level
        links[@level.name] << {text: '[E]dit', url: edit_level_path(@level), access_key: 'e'}
        if @level.is_a?(Javalab) || @level.is_a?(Pythonlab) || @level.is_a?(Weblab2)
          links[@level.name] << {text: "[s]tart", url: edit_blocks_level_path(@level, :start_sources), access_key: 's'}
          links[@level.name] << {text: "e[x]emplar", url: edit_exemplar_level_path(@level), access_key: 'x'}
        end
      else
        links[@level.name] << {text: '(Cannot edit)', url: ''}
      end
      if @level.is_a?(LevelGroup)
        links["Sublevels"] = @level.levels.map {|sublevel| {text: sublevel.name, url: level_path(sublevel)}}
      end

      if project_template_level_name = @level.properties['project_template_level_name']
        project_template_level = Level.find_by_name(project_template_level_name)
        links["Template Level"] = [
          {text: project_template_level_name, url: level_path(project_template_level)}
        ]
        template_level_edit_link =
          if can_edit_level
            {text: 'Edit', url: edit_level_path(project_template_level)}
          else
            {text: '(Cannot edit)', url: ''}
          end
        links["Template Level"] << template_level_edit_link
      end

    elsif @script_level
      links[@level.name] << {
        text: 'edit on levelbuilder',
        url: URI.join("https://levelbuilder-studio.code.org/", build_script_level_path(@script_level, @extra_params)).to_s
      }
    end

    script_level_path_links = []
    script_levels = @level.script_levels.includes(:script)

    script_levels.each do |script_level|
      script_level_path = build_script_level_path(script_level)

      script_level_path_links << {
        script: script_level.script.name,
        path: script_level_path
      }
    end
    # TODO: Not present here, but present in original extra links. Some of these can be handled on the client side.
    # Anything project-specific should be handled via a separate API, as this controller has no context for projects.
    # Gamelab show animation json, list contained levels, Blockly start/toolbox/etc, Blockly helpers, list of parent
    # levels, all project validator links (should be handled elsewhere), abuse handlers (should be handled elsewhere).

    render json: {
      links: links,
      can_clone: can?(:clone, @level),
      can_delete: can?(:delete, @level),
      level_name: @level.name,
      script_level_path_links: script_level_path_links,
    }
  end

  # Use callbacks to share common setup or constraints between actions.
  private def set_level
    @level =
      if params.include? :key
        Level.find_by_key params[:key]
      else
        Level.find(params[:id])
      end
    @game = @level.game
  end

  # Never trust parameters from the scary internet, only allow the allow-list through.
  private def level_params
    permitted_params = [
      :name,
      :notes,
      :type,
      :level_num,
      :user,
      :dsl_text,
      :encrypted,
      :published,
      :title,
      :description,
      {poems: []},
      {concept_ids: []},
      {level_concept_difficulty_attributes: [:id] + LevelConceptDifficulty::CONCEPTS},
      {soft_buttons: []},
      {contained_level_names: []},
      {examples: []},
      {reference_links: []},
      {helper_libraries: []},
      {block_pools: []},
      {preload_asset_list: []},
      :map_reference,

      # Minecraft-specific
      {available_blocks: []},
      {drop_dropdown_options: []},
      {if_block_options: []},
      {place_block_options: []},
      {play_sound_options: []},

      # Poetry-specific
      {available_poems: []},

      # Dance Party-specific
      {song_selection: []},
    ]

    # http://stackoverflow.com/questions/8929230/why-is-the-first-element-always-blank-in-my-rails-multi-select
    multiselect_params = [
      :soft_buttons,
      :available_blocks,
      :drop_dropdown_options,
      :if_block_options,
      :place_block_options,
      :play_sound_options,
      :helper_libraries,
      :block_pools,
      :available_poems,
      :song_selection
    ]
    multiselect_params.each do |param|
      params[:level][param].delete_if(&:empty?) if params[:level][param].is_a? Array
    end

    # Reference links should be stored as an array.
    if params[:level][:reference_links].is_a? String
      params[:level][:reference_links] = params[:level][:reference_links].split("\r\n")
      params[:level][:reference_links].compact_blank!
    end

    permitted_params.concat(Level.permitted_params)
    params[:level].permit(permitted_params)
  end

  private def handle_json_params(level_params)
    # Parse a few specific JSON fields used by modern (Lab2) labs so that they are
    # stored in the database as a first-order member of the properties JSON, rather
    # than simply as a string of JSON belonging to a single property.
    [:level_data, :aichat_settings, :validations, :panels, :predict_settings].each do |key|
      level_params[key] = JSON.parse(level_params[key]) if level_params[key]
    end
    # Delete validations from level data if present. We'll use the validations in level properties instead.
    level_params[:level_data].delete('validations') if level_params[:level_data]&.key?('validations')
    level_params
  end

  private def set_solution_image_url(level)
    level_source = LevelSource.find_identical_or_create(
      level,
      params[:program].strip_utf8mb4
    )
    level_source_image = find_or_create_level_source_image(
      params[:image],
      level_source,
      true
    )
    @level.properties['solution_image_url'] = level_source_image.s3_url if level_source_image
  end

  # Gathers data on top pain points for level builders by logging error details
  # to Firehose / Redshift.
  private def log_save_error(level)
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'level-save-error',
        # Make it easy to count most frequent field name in which errors occur.
        event: level.errors.keys.first,
        # Level ids are different on levelbuilder, so use the level name. The
        # level name can be joined on, against the levels table, to determine the
        # level type or other level properties.
        data_string: level.name,
        data_json: {
          errors: level.errors.to_h,
          # User ids are different on levelbuilder, so use the email.
          user_email: current_user.email,
        }.to_json
      }
    )
  end
end
