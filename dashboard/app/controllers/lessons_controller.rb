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
      editableData: {
        name: @lesson.name,
        overview: @lesson.overview,
        studentOverview: @lesson.student_overview,
        assessment: @lesson.assessment,
        unplugged: @lesson.unplugged,
        lockable: @lesson.lockable,
        creativeCommonsLicense: @lesson.creative_commons_license,
        purpose: @lesson.purpose,
        preparation: @lesson.preparation,
        announcements: @lesson.announcements,
        resources: @lesson.resources
      }
    }
  end

  # PATCH/PUT /lessons/1
  def update
    if lesson_params.key?('resources')
      lesson_resource_keys = lesson_params['resources'] || []
      resource_keys_in_lesson = @lesson.resources.map(&:key) || []
      resource_keys_to_add = lesson_resource_keys - resource_keys_in_lesson
      resource_keys_to_add.each do |resource_key|
        persisted_resource = Resource.find_by_key(resource_key)
        @lesson.resources << persisted_resource if persisted_resource
      end
      resource_keys_to_remove = resource_keys_in_lesson - lesson_resource_keys
      resource_keys_to_remove.each do |resource_key|
        persisted_resource = Resource.find_by_key(resource_key)
        @lesson.resources.delete(persisted_resource) if persisted_resource
      end
    end
    @lesson.update!(lesson_params.except(:resources))

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
