require "csv"
require "naturally"
require 'cdo/firehose'

EMPTY_XML = '<xml></xml>'.freeze

class LevelsController < ApplicationController
  include LevelsHelper
  include ActiveSupport::Inflector
  before_action :authenticate_user!, except: [:show, :embed_level, :get_rubric]
  before_action :require_levelbuilder_mode, except: [:show, :index, :embed_level, :get_rubric]
  load_and_authorize_resource except: [:create, :update_blocks, :edit_blocks, :embed_level, :get_rubric]
  check_authorization except: [:get_rubric]

  before_action :set_level, only: [:show, :edit, :update, :destroy]

  LEVELS_PER_PAGE = 30

  # All level types that can be requested via /levels/new
  LEVEL_CLASSES = [
    Applab,
    Artist,
    Bounce,
    BubbleChoice,
    Calc,
    ContractMatch,
    Craft,
    CurriculumReference,
    Dancelab,
    Eval,
    EvaluationMulti,
    External,
    ExternalLink,
    Flappy,
    FreeResponse,
    FrequencyAnalysis,
    Gamelab,
    GamelabJr,
    Karel,
    LevelGroup,
    Map,
    Match,
    Maze,
    Multi,
    NetSim,
    Odometer,
    Pixelation,
    PublicKeyCryptography,
    StandaloneVideo,
    StarWarsGrid,
    Studio,
    TextCompression,
    TextMatch,
    Unplugged,
    Vigenere,
    Weblab
  ]

  # GET /levels
  # GET /levels.json
  def index
    @levels = @levels.order(updated_at: :desc)
    @levels = @levels.where('levels.name LIKE ?', "%#{params[:name]}%") if params[:name]
    @levels = @levels.where('levels.type = ?', params[:level_type]) if params[:level_type].present?
    @levels = @levels.joins(:script_levels).where('script_levels.script_id = ?', params[:script_id]) if params[:script_id].present?
    @levels = @levels.page(params[:page]).per(LEVELS_PER_PAGE)
    @level_types = LEVEL_CLASSES.map(&:name)
    @scripts = Script.valid_scripts(current_user).pluck(:name, :id).sort_by {|a| a[0]}
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
      small_footer: @game.uses_small_footer? || @level.enable_scrolling?,
      has_i18n: @game.has_i18n?
    )
  end

  # GET /levels/1/edit
  def edit
  end

  # GET all the information for the mini rubric
  def get_rubric
    @level = Level.find_by(id: params[:level_id])
    if @level.mini_rubric&.to_bool
      render json: {
        keyConcept: @level.rubric_key_concept,
        performanceLevel1: @level.rubric_performance_level_1,
        performanceLevel2: @level.rubric_performance_level_2,
        performanceLevel3: @level.rubric_performance_level_3,
        performanceLevel4: @level.rubric_performance_level_4
      }
    end
  end

  # Action for using blockly workspace as a toolbox/startblock editor.
  # Expects params[:type] which can be either 'toolbox_blocks' or 'start_blocks'
  def edit_blocks
    @level = Level.find(params[:level_id])
    authorize! :edit, @level
    type = params[:type]
    blocks_xml = @level.properties[type].presence || @level[type] || EMPTY_XML

    blocks_xml = Blockly.convert_category_to_toolbox(blocks_xml) if type == 'toolbox_blocks'

    # By default, allow levels to define their own toolboxes for all
    # types
    toolbox_blocks = @level.complete_toolbox(type)

    # Levels which support (and have )solution blocks use those blocks
    # as the toolbox for required and recommended block editors, plus
    # the special "pick one" block
    can_use_solution_blocks = @level.respond_to?("get_solution_blocks") &&
        @level.properties['solution_blocks']
    should_use_solution_blocks = type == 'required_blocks' || type == 'recommended_blocks'
    if can_use_solution_blocks && should_use_solution_blocks
      blocks = @level.get_solution_blocks + ["<block type=\"pick_one\"></block>"]
      toolbox_blocks = "<xml>#{blocks.join('')}</xml>"
    end

    level_view_options(
      @level.id,
      start_blocks: blocks_xml,
      toolbox_blocks: toolbox_blocks,
      edit_blocks: type,
      skip_instructions_popup: true
    )
    view_options(full_width: true)
    @game = @level.game
    @callback = level_update_blocks_path @level, type

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

  def update_blocks
    @level = Level.find(params[:level_id])
    authorize! :update, @level
    blocks_xml = params[:program]
    type = params[:type]
    set_solution_image_url(@level) if type == 'solution_blocks'
    blocks_xml = Blockly.convert_toolbox_to_category(blocks_xml) if type == 'toolbox_blocks'
    @level.properties[type] = blocks_xml
    @level.log_changes(current_user)
    @level.save!
    render json: {redirect: level_url(@level)}
  end

  def update_properties
    @level = Level.find(params[:level_id])
    authorize! :update, @level

    changes = JSON.parse(request.body.read)
    changes.each do |key, value|
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
        @level.name.downcase == level_params[:name].downcase
      # do not allow case-only changes in the level name because that confuses git on OSX
      @level.errors.add(:name, 'Cannot change only the capitalization of the level name (it confuses git on OSX)')
      log_save_error(@level)
      render json: @level.errors, status: :unprocessable_entity
      return
    end

    @level.assign_attributes(level_params)
    @level.log_changes(current_user)

    if @level.save
      redirect = params["redirect"] || level_url(@level, show_callouts: 1)
      render json: {redirect: redirect}
    else
      log_save_error(@level)
      render json: @level.errors, status: :unprocessable_entity
    end
  end

  # POST /levels
  # POST /levels.json
  def create
    authorize! :create, Level
    type_class = level_params[:type].constantize

    # Set some defaults.
    params[:level][:skin] ||= type_class.skins.first if type_class <= Blockly
    if type_class <= Grid
      default_tile = type_class == Karel ? {"tileType": 0} : 0
      start_tile = type_class == Karel ? {"tileType": 2} : 2
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

    create_level_params = level_params

    # Give platformization partners permission to edit any levels they create.
    editor_experiment = Experiment.get_editor_experiment(current_user)
    create_level_params[:editor_experiment] = editor_experiment if editor_experiment

    begin
      @level = type_class.create_from_level_builder(params, create_level_params)
    rescue ArgumentError => e
      render(status: :not_acceptable, text: e.message) && return
    rescue ActiveRecord::RecordInvalid => invalid
      render(status: :not_acceptable, text: invalid) && return
    end

    render json: {redirect: edit_level_path(@level)}
  end

  # DELETE /levels/1
  # DELETE /levels/1.json
  def destroy
    @level.destroy
    redirect_to(params[:redirect] || levels_url)
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
      elsif @type_class <= Calc
        @game = Game.calc
      elsif @type_class <= Eval
        @game = Game.eval
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
      elsif @type_class == CurriculumReference
        @game = Game.curriculum_reference
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
    render json: {redirect: edit_level_url(@new_level)}
  rescue ArgumentError => e
    render(status: :not_acceptable, text: e.message)
  rescue ActiveRecord::RecordInvalid => invalid
    render(status: :not_acceptable, text: invalid)
  end

  def embed_level
    authorize! :read, :level
    @level = Level.find(params[:level_id])
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

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_level
    @level =
      if params.include? :key
        Level.find_by_key params[:key]
      else
        Level.find(params[:id])
      end
    @game = @level.game
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def level_params
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
    ]
    multiselect_params.each do |param|
      params[:level][param].delete_if(&:empty?) if params[:level][param].is_a? Array
    end

    # Reference links should be stored as an array.
    if params[:level][:reference_links].is_a? String
      params[:level][:reference_links] = params[:level][:reference_links].split("\r\n")
      params[:level][:reference_links].delete_if(&:blank?)
    end

    permitted_params.concat(Level.permitted_params)
    params[:level].permit(permitted_params)
  end

  def set_solution_image_url(level)
    level_source = LevelSource.find_identical_or_create(
      level,
      params[:program].strip_utf8mb4
    )
    level_source_image = find_or_create_level_source_image(
      params[:image],
      level_source.try(:id),
      true
    )
    @level.properties['solution_image_url'] = level_source_image.s3_url if level_source_image
  end

  # Gathers data on top pain points for level builders by logging error details
  # to Firehose / Redshift.
  def log_save_error(level)
    FirehoseClient.instance.put_record(
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
    )
  end
end
