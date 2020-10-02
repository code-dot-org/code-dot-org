class LessonsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode, except: [:show]

  # GET /lessons/1
  def show
    @lesson_data = {
      title: @lesson.localized_title,
      overview: @lesson.overview,
      announcements: @lesson.announcements,
      purpose: @lesson.purpose,
      preparation: @lesson.preparation
    }
  end

  # GET /lessons/1/edit
  def edit
    @lesson_data = {
      editableData: @lesson.summarize_editable_data
    }
  end

  # PATCH/PUT /lessons/1
  def update
    @lesson.update!(lesson_params)
    update_activities(JSON.parse(params[:activities])) if params[:activities]

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
      :announcements
    )
    lp[:announcements] = JSON.parse(lp[:announcements]) if lp[:announcements]
    lp
  end

  # @param activities [Array<Hash>]
  def update_activities(activities)
    return unless activities
    # use assignment to delete any missing activities.
    @lesson.lesson_activities = activities.map do |activity|
      lesson_activity = fetch_activity(activity)
      lesson_activity.update!(
        position: activity['position'],
        name: activity['name'],
        duration: activity['duration']
      )

      lesson_activity.update_activity_sections(activity['activitySections'])
      lesson_activity
    end
  end

  # Finds the LessonActivity by id, or creates a new one if id is not specified.
  # @param activity [Hash]
  # @returns [LessonActivity]
  def fetch_activity(activity)
    if activity['id']
      lesson_activity = @lesson.lesson_activities.find(activity['id'])
      raise "LessonActivity id #{activity['id']} not found in Lesson id #{@lesson.id}" unless lesson_activity
      return lesson_activity
    end

    @lesson.lesson_activities.create(
      position: activity['position'],
      seeding_key: SecureRandom.uuid
    )
  end
end
