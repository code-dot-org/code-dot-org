class LessonsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode_or_test_env, except: [:show]
  before_action :disallow_legacy_script_levels, only: [:edit, :update]

  # Script levels which are not in activity sections will not show up on the
  # lesson edit page, in which case saving the edit page would cause those
  # script levels to be lost. Prevent this by disallowing editing in this case.
  # This helps avoid losing data from existing scripts by accidentally editing
  # them with the new lessons editor.
  def disallow_legacy_script_levels
    return unless @lesson.script_levels.reject(&:activity_section).any?
    raise CanCan::AccessDenied.new(
      "cannot edit lesson #{@lesson.id} because it contains legacy script levels"
    )
  end

  # GET /lessons/1
  def show
    @lesson_data = @lesson.summarize_for_lesson_show(@current_user)
  end

  # GET /lessons/1/edit
  def edit
    @lesson_data = @lesson.summarize_for_lesson_edit
    @related_lessons = @lesson.summarize_related_lessons
    @search_options = Level.search_options
    view_options(full_width: true)
  end

  # PATCH/PUT /lessons/1
  def update
    resources = (lesson_params['resources'] || []).map {|key| Resource.find_by_key(key)}
    ActiveRecord::Base.transaction do
      @lesson.resources = resources.compact
      @lesson.update!(lesson_params.except(:resources, :objectives))
      @lesson.update_activities(JSON.parse(params[:activities])) if params[:activities]
      @lesson.update_objectives(JSON.parse(params[:objectives])) if params[:objectives]
    end

    render json: @lesson.summarize_for_lesson_edit
  rescue ActiveRecord::RecordNotFound, ActiveRecord::RecordInvalid => e
    render(status: :not_acceptable, plain: e.message)
  end

  private

  def lesson_params
    # Convert camelCase params to snake_case. Right now this only works on
    # top-level key names. This lets us do the transformation before calling
    # .permit, so that we can use snake_case key names in our parameter list,
    # because transform_keys returns a params object while deep_transform_keys
    # returns a plain Hash.
    lp = params.transform_keys(&:underscore)

    # for now, only allow editing of fields that cannot be edited on the
    # script edit page.
    lp = lp.permit(
      :name,
      :overview,
      :student_overview,
      :assessment_opportunities,
      :assessment,
      :unplugged,
      :creative_commons_license,
      :lockable,
      :purpose,
      :preparation,
      :announcements,
      :resources,
      :objectives
    )
    lp[:announcements] = JSON.parse(lp[:announcements]) if lp[:announcements]
    lp[:resources] = JSON.parse(lp[:resources]) if lp[:resources]
    lp
  end
end
