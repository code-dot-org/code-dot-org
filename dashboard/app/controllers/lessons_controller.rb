class LessonsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode_or_test_env, except: [:show]

  # GET /lessons/1
  def show
    @lesson_data = {
      unit: {
        displayName: @lesson.script.localized_title,
        link: @lesson.script.link
      },
      displayName: @lesson.localized_title,
      overview: @lesson.overview || '',
      announcements: @lesson.announcements,
      purpose: @lesson.purpose || '',
      preparation: @lesson.preparation || ''
    }
  end

  # GET /lessons/1/edit
  def edit
    @lesson_data = @lesson.summarize_for_lesson_edit
    @related_lessons = @lesson.summarize_related_lessons
  end

  # PATCH/PUT /lessons/1
  def update
    resources = (lesson_params['resources'] || []).map {|key| Resource.find_by_key(key)}
    @lesson.resources = resources.compact
    @lesson.update!(lesson_params.except(:resources))
    @lesson.update_activities(JSON.parse(params[:activities])) if params[:activities]

    redirect_to lesson_path(id: @lesson.id)
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
      :overview,
      :student_overview,
      :assessment,
      :unplugged,
      :creative_commons_license,
      :lockable,
      :purpose,
      :preparation,
      :announcements,
      :resources
    )
    lp[:announcements] = JSON.parse(lp[:announcements]) if lp[:announcements]
    lp[:resources] = JSON.parse(lp[:resources]) if lp[:resources]
    lp
  end
end
