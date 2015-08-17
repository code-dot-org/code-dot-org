class ScriptLevelsController < ApplicationController
  check_authorization
  include LevelsHelper

  def reset
    authorize! :read, ScriptLevel
    @script = Script.get_from_cache(params[:script_id])

    # delete the session if the user is not signed in
    # and start them at the beginning of the script.
    # If the user is signed in, continue normally
    reset_session unless current_user
    redirect_to(build_script_level_path(@script.starting_level)) and return
  end

  def next
    authorize! :read, ScriptLevel
    @script = Script.get_from_cache(params[:script_id])

    redirect_to(build_script_level_path(next_script_level)) and return
  end

  def show
    authorize! :read, ScriptLevel
    @script = Script.get_from_cache(params[:script_id])

    load_script_level

    if request.path != (canonical_path = build_script_level_path(@script_level))
      canonical_path << "?#{request.query_string}" unless request.query_string.empty?
      redirect_to canonical_path, status: :moved_permanently
      return
    end

    load_user
    load_section

    present_level

    slog(tag: 'activity_start',
         script_level_id: @script_level.id,
         level_id: @script_level.level.id,
         user_agent: request.user_agent,
         locale: locale) if @script_level.level.finishable?
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
    authorize! :read, @script_level
  end

  def load_level_source
    return if @level.game.name == 'Jigsaw'

    if params[:solution] && @ideal_level_source = @level.ideal_level_source
      authorize! :manage, :teacher
      level_source = @ideal_level_source
      level_view_options(share: true)
      view_options(readonly_workspace: true,
                   callouts: [],
                   full_width: true)
    elsif @user && current_user && @user != current_user
      level_source = @user.last_attempt(@level).try(:level_source)
      view_options(readonly_workspace: true,
                   callouts: [])
    elsif current_user
      # Set start blocks to the user's previous attempt at this puzzle.
      level_source = current_user.last_attempt(@level).try(:level_source)
    end

    level_source.try(:replace_old_when_run_blocks)
    @last_attempt = level_source.try(:data)
  end

  def load_user
    return if params[:user_id].blank?

    user = User.find(params[:user_id])

    # TODO this should use cancan/authorize
    if user.student_of?(current_user)
      @user = user
      @user_level = @user.user_level_for(@script_level)
    end
  end

  def load_section
    if params[:section_id]
      section = Section.find(params[:section_id])

      # TODO this should use cancan/authorize
      if section.user == current_user
        @section = section
      end
    elsif current_user.try(:sections) && current_user.sections.count == 1
      @section = current_user.sections.first
    end
  end

  def present_level
    # All database look-ups should have already been cached by Script::script_cache_from_db
    @level = @script_level.level
    @game = @level.game
    @stage = @script_level.stage

    load_level_source

    @callback = milestone_url(user_id: current_user.try(:id) || 0, script_level_id: @script_level.id)
    view_options(
      full_width: true,
      no_footer: !@game.has_footer?,
      small_footer: @game.uses_small_footer? || enable_scrolling?,
      has_i18n: @game.has_i18n?
    )

    @@fallback_responses ||= {}
    @fallback_response = @@fallback_responses[@script_level.id] ||= {
      success: milestone_response(script_level: @script_level, solved?: true),
      failure: milestone_response(script_level: @script_level, solved?: false)
    }
    render 'levels/show', formats: [:html]
  end
end
