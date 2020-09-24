class LessonsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode, except: [:show]

  # GET /lessons/1
  def show
    @lesson_data = @lesson.to_camelized_hash
    @lesson_data[:title] = @lesson.localized_title
  end

  # GET /lessons/1/edit
  def edit
    @lesson_data = {
      id: @lesson.id,
      lesson: @lesson.to_camelized_hash
    }
  end

  # PATCH/PUT /lessons/1
  def update
    @lesson.update!(lesson_params)

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

    lp = lp.permit(LessonSerializer._attributes)
    lp[:announcements] = JSON.parse(lp[:announcements]) if lp[:announcements]
    lp
  end
end
