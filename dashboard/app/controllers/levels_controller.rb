require "csv"
require "naturally"

EMPTY_XML = '<xml></xml>'

class LevelsController < ApplicationController
  include LevelsHelper
  include ActiveSupport::Inflector
  before_filter :authenticate_user!, except: [:show, :embed_blocks, :embed_level]
  before_filter :require_levelbuilder_mode, except: [:show, :index, :embed_blocks, :embed_level]
  skip_before_filter :verify_params_before_cancan_loads_model, only: [:create, :update_blocks]
  load_and_authorize_resource except: [:create, :update_blocks, :edit_blocks, :embed_blocks, :embed_level]
  check_authorization

  before_action :set_level, only: [:show, :edit, :update, :destroy]

  # GET /levels
  # GET /levels.json
  def index
    @levels = Level.all
  end

  # GET /levels/1
  # GET /levels/1.json
  def show
    view_options(
        full_width: true,
        small_footer: @game.uses_small_footer? || enable_scrolling?,
        has_i18n: @game.has_i18n?
    )
  end

  # GET /levels/1/edit
  def edit
  end

  # Action for using blockly workspace as a toolbox/startblock editor.
  # Expects params[:type] which can be either 'toolbox_blocks' or 'start_blocks'
  def edit_blocks
    @level = Level.find(params[:level_id])
    authorize! :edit, @level
    type = params[:type]
    blocks_xml = @level.properties[type].presence || @level[type] || EMPTY_XML

    blocks_xml = Blockly.convert_category_to_toolbox(blocks_xml) if type == 'toolbox_blocks'
    level_view_options(
      start_blocks: blocks_xml,
      toolbox_blocks: @level.complete_toolbox(type), # Provide complete toolbox for editing start/toolbox blocks.
      edit_blocks: type,
      skip_instructions_popup: true
    )
    view_options(full_width: true)
    @game = @level.game
    @callback = level_update_blocks_path @level, type

    # Ensure the simulation ends right away when the user clicks 'Run' while editing blocks
    level_view_options(success_condition: 'function () { return true; }') if @level.is_a? Studio

    show
    render :show
  end

  def update_blocks
    @level = Level.find(params[:level_id])
    authorize! :update, @level
    blocks_xml = params[:program]
    type = params[:type]
    blocks_xml = Blockly.convert_toolbox_to_category(blocks_xml) if type == 'toolbox_blocks'
    @level.properties[type] = blocks_xml
    if @level.respond_to?("add_missing_toolbox_blocks") && type == 'solution_blocks'
      @level.add_missing_toolbox_blocks
    end
    @level.save!
    render json: { redirect: level_url(@level) }
  end

  # PATCH/PUT /levels/1
  # PATCH/PUT /levels/1.json
  def update
    if level_params[:name] &&
        @level.name != level_params[:name] &&
        @level.name.downcase == level_params[:name].downcase
      # do not allow case-only changes in the level name because that confuses git on OSX
      @level.errors.add(:name, 'Cannot change only the capitalization of the level name (it confuses git on OSX)')
      render json: @level.errors, status: :unprocessable_entity
      return
    end
    if @level.update(level_params)
      render json: { redirect: level_url(@level, show_callouts: true) }
    else
      render json: @level.errors, status: :unprocessable_entity
    end
  end

  # POST /levels
  # POST /levels.json
  def create
    authorize! :create, :level
    type_class = level_params[:type].constantize

    # Set some defaults.
    params[:level].reverse_merge!(skin: type_class.skins.first) if type_class <= Blockly
    if type_class <= Grid
      default_tile = type_class == Karel ? {"tileType": 0} : 0
      start_tile = type_class == Karel ? {"tileType": 2} : 2
      params[:level][:maze_data] = Array.new(8){Array.new(8){default_tile}}
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

    begin
      @level = type_class.create_from_level_builder(params, level_params)
    rescue ArgumentError => e
      render(status: :not_acceptable, text: e.message) && return
    rescue ActiveRecord::RecordInvalid => invalid
      render(status: :not_acceptable, text: invalid) && return
    end

    render json: { redirect: edit_level_path(@level) }
  end

  # DELETE /levels/1
  # DELETE /levels/1.json
  def destroy
    @level.destroy
    redirect_to(params[:redirect] || levels_url)
  end

  def new
    authorize! :create, :level
    if params.has_key? :type
      @type_class = params[:type].constantize
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
      end
      @level = @type_class.new
      render :edit
    else
      @levels = Naturally.sort_by(Level.where(user: current_user), :name)
    end
  end

  # POST /levels/1/clone?name=new_name
  def clone
    if params[:name]
      # Clone existing level and open edit page
      old_level = Level.find(params[:level_id])
      @level = old_level.dup
      begin
        @level.update!(name: params[:name])
      rescue ArgumentError => e
        render(status: :not_acceptable, text: e.message) && return
      rescue ActiveRecord::RecordInvalid => invalid
        render(status: :not_acceptable, text: invalid) && return
      end
      render json: {redirect: edit_level_url(@level)}
    else
      render status: :not_acceptable, text: 'New name required to clone level'
    end
  end

  def embed_blocks
    authorize! :read, :level
    level = Level.find(params[:level_id])
    block_type = params[:block_type]
    options = {
        app: level.game.app,
        readonly: true,
        locale: js_locale,
        baseUrl: Blockly.base_url,
        blocks: level.blocks_to_embed(level.properties[block_type])
    }
    render :embed_blocks, layout: false, locals: options
  end

  def embed_level
    authorize! :read, :level
    @level = Level.find(params[:level_id])
    @game = @level.game
    level_view_options(
      embed: true,
      share: false,
      skip_instructions_popup: true
    )
    view_options full_width: true
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
      {poems: []},
      {concept_ids: []},
      {soft_buttons: []},
      {examples: []}
    ]

    # http://stackoverflow.com/questions/8929230/why-is-the-first-element-always-blank-in-my-rails-multi-select
    params[:level][:soft_buttons].delete_if(&:empty?) if params[:level][:soft_buttons].is_a? Array
    permitted_params.concat(Level.serialized_properties.values.flatten)
    params[:level].permit(permitted_params)
  end
end
