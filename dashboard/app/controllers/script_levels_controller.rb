class ScriptLevelsController < ApplicationController
  check_authorization
  before_filter :authenticate_user!, :only => [:solution]
  include LevelsHelper

  def solution
    authorize! :show, ScriptLevel
    if current_user.teacher? || current_user.admin?
      @level = Level.find(params[:level_id])
      @start_blocks = @level.ideal_level_source.try(:data)
      @game = @level.game
      @full_width = true
      @share = true
      @level_source_id = @level.ideal_level_source_id
      @level_source = LevelSource.find(@level_source_id)
      render 'level_sources/show'
    else
      flash[:alert] = I18n.t('reference_area.auth_error')
      redirect_to root_path
    end
  end

  def show
    authorize! :show, ScriptLevel
    @script = Script.get_from_cache(params[:script_id])

    if params[:reset]
      # reset is a special mode which will delete the session if the user is not signed in
      # and start them at the beginning of the script.
      # If the user is signed in, continue normally
      reset_session if !current_user
      redirect_to(build_script_level_path(@script.starting_level)) and return
    end

    if params[:id] == ScriptLevel::NEXT || params[:chapter] == ScriptLevel::NEXT
      redirect_to(build_script_level_path(next_script_level)) and return
    end

    load_script_level

    if request.path != (canonical_path = build_script_level_path(@script_level))
      redirect_to canonical_path, status: :moved_permanently
      return
    end

    present_level

    slog(:tag => 'activity_start',
         :script_level_id => @script_level.id,
         :level_id => @script_level.level.id,
         :user_agent => request.user_agent,
         :locale => locale) unless @script_level.level.unplugged?
  end

private
  def next_script_level
    user_or_session_level || @script.starting_level
  end

  def user_or_session_level
    if current_user
      current_user.next_unpassed_progression_level(@script).try(:or_next_progression_level)
    else
      find_next_level_for_session(@script)
    end
  end

  # Attempts to find the next level for this session and script
  def find_next_level_for_session(script)
    session_progress = session[:progress] || {}

    script.script_levels.each do |sl|
      next unless sl.valid_progression_level?
      passed_level = session_progress.fetch(sl.level_id, -1) < Activity::MINIMUM_PASS_RESULT
      return sl if passed_level
    end

    nil
  end

  def load_script_level
    if params[:chapter]
      @script_level = @script.get_script_level_by_chapter(params[:chapter])
    elsif params[:stage_id]
      @script_level = @script.get_script_level_by_stage_and_position(params[:stage_id], params[:id])
    else
      @script_level = @script.get_script_level_by_id(params[:id])
    end
    raise ActiveRecord::RecordNotFound unless @script_level
  end

  def present_level
    @level = @script_level.level
    @game = @level.game

    @stage = @script_level.stage # this should be included
    cached_script = Script.get_from_cache(@script.id)
    if @stage
      @game_script_levels = cached_script.script_levels.to_a.select{|sl| sl.stage_id == @script_level.stage_id}
    else
      @game_script_levels = cached_script.script_levels.to_a.select{|sl| sl.level.game_id == @script_level.level.game_id}
    end

    set_videos_and_blocks_and_callouts_and_instructions

    @callback = milestone_url(user_id: current_user.try(:id) || 0, script_level_id: @script_level)
    @full_width = true

    @@fallback_responses ||= {}
    @fallback_response = @@fallback_responses[@script_level.id] ||= {
      success: milestone_response(script_level: @script_level, solved?: true),
      failure: milestone_response(script_level: @script_level, solved?: false)
    }
    render 'levels/show', formats: [:html]
  end
end
