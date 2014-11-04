require "csv"
require "naturally"

class LevelsController < ApplicationController
  include LevelsHelper
  include ActiveSupport::Inflector
  before_filter :authenticate_user!
  before_filter :can_modify?, except: [:show, :index]
  skip_before_filter :verify_params_before_cancan_loads_model, :only => [:create, :update_blocks]
  load_and_authorize_resource :except => [:create, :update_blocks, :edit_blocks]
  check_authorization

  before_action :set_level, only: [:show, :edit, :update, :destroy]

  # GET /levels
  # GET /levels.json
  def index
    @levels = Level.order(:game_id)
  end

  # GET /levels/1
  # GET /levels/1.json
  def show
    set_videos_and_blocks_and_callouts

    @fallback_response = {
      success: {message: 'good job'},
      failure: {message: 'try again'}
    }

    @full_width = true
  end

  # GET /levels/1/edit
  def edit
    if @level.is_a? Grid
      @level.maze_data = @level.class.unparse_maze(@level.properties)
    end
    if @level.is_a? Match
      @filename = @level.filename
      @match_file = File.read(@filename) if @filename && File.exists?(@filename)
    end
  end

  # Action for using blockly workspace as a toolbox/startblock editor.
  # Expects params[:type] which can be either 'toolbox_blocks' or 'start_blocks'
  def edit_blocks
    @level = Level.find(params[:level_id])
    authorize! :edit, @level
    type = params[:type]
    blocks_xml = @level.properties[type].presence || @level[type]
    blocks_xml = Blockly.convert_category_to_toolbox(blocks_xml) if type == 'toolbox_blocks'
    @start_blocks = blocks_xml
    @toolbox_blocks = @level.complete_toolbox(type)  # Provide complete toolbox for editing start/toolbox blocks.
    @game = @level.game
    @full_width = true
    @callback = level_update_blocks_path @level, type
    @edit_blocks = type
    @skip_instructions_popup = true

    # Ensure the simulation ends right away when the user clicks 'Run' while editing blocks
    @level.properties['success_condition'] = 'function () { return true; }' if @level.is_a? Studio

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
    @level.save!
    render json: { redirect: level_url(@level) }
  end

  # PATCH/PUT /levels/1
  # PATCH/PUT /levels/1.json
  def update
    if @level.update(level_params)
      render json: { redirect: level_url(@level) }.to_json
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
      params[:level][:maze_data] = Array.new(8){Array.new(8){0}}
      params[:level][:maze_data][0][0] = 2
    end
    if type_class <= Studio
      params[:level][:maze_data][0][0] = 16 # studio must have at least 1 actor
      params[:level][:soft_buttons] = nil
      params[:level][:success_condition] = Studio.default_success_condition
      params[:level][:failure_condition] = Studio.default_failure_condition
    end
    params[:level][:maze_data] = params[:level][:maze_data].to_json if type_class <= Grid
    params.merge!(user: current_user)

    begin
      @level = type_class.create_from_level_builder(params, level_params)
    rescue ArgumentError => e
      render status: :not_acceptable, text: e.message and return
    rescue ActiveRecord::RecordInvalid => invalid
      render status: :not_acceptable, text: invalid and return
    end

    render json: { redirect: edit_level_path(@level) }.to_json
  end

  # DELETE /levels/1
  # DELETE /levels/1.json
  def destroy
    @level.destroy
    redirect_to(params[:redirect] || levels_url)
  end

  def new
    authorize! :create, :level
    @type_class = params[:type].try(:constantize)
    # Can't use case/when because a constantized string does not === the class by that name.
    if @type_class
      if @type_class == Artist
        artist_builder
      elsif @type_class <= Studio
        @game = Game.custom_studio
        @level = @type_class.new
        render :edit
      elsif @type_class <= Calc
        @game = Game.calc
        @level = @type_class.new
        render :edit
      elsif @type_class <= Eval
        @game = Game.eval
        @level = @type_class.new
        render :edit
      elsif @type_class <= Maze
        @game = Game.custom_maze
        @level = @type_class.new
        render :edit
      elsif @type_class <= Match
        @game = Game.find_by(name: @type_class.to_s)
        @level = @type_class.new
        render :edit
      end
    end
    @levels = Naturally.sort_by(Level.where(user: current_user), :name)
  end

  # POST /levels/1/clone
  def clone
    # Clone existing level and open edit page
    old_level = Level.find(params[:level_id])
    @level = old_level.dup
    # resolve duplicate name conflicts with 'X (copy); X (copy 2); X (copy 3)... X (copy 10)'
    name = "#{old_level.name} (copy 0)"
    begin result = @level.update(name: name.next!) end until result
    redirect_to(edit_level_url(@level))
  end

  def artist_builder
    authorize! :create, :level
    @level = Artist.builder
    @game = @level.game
    @full_width = true
    @artist_builder = true
    @callback = levels_path(game_id: @game.id)
    @level.x = Integer(params[:x]) rescue nil
    @level.y = Integer(params[:y]) rescue nil
    @level.start_direction = Integer(params[:start_direction]) rescue nil
    @level.toolbox_blocks = @level.complete_toolbox('toolbox_blocks')  # Provide complete toolbox for editing start/toolbox blocks.
    show
    render :show
  end

  def can_modify?
    unless Rails.env.levelbuilder? || Rails.env.development?
      raise CanCan::AccessDenied.new('Cannot create or modify levels from this environment.')
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_level
      @level = Level.find(params[:id])
      @game = @level.game
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def level_params
      permitted_params = [
        :name,
        :type,
        :level_num,
        :user,
        :match_text,
        {concept_ids: []},
        {soft_buttons: []}
      ]

      # http://stackoverflow.com/questions/8929230/why-is-the-first-element-always-blank-in-my-rails-multi-select
      params[:level][:soft_buttons].delete_if{ |s| s.empty? } if params[:level][:soft_buttons].is_a? Array

      permitted_params.concat(Level.serialized_properties.values.flatten)
      params[:level].permit(permitted_params)
    end
end
