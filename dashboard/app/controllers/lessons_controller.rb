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
      id: @lesson.id,
      name: @lesson.name,
      overview: @lesson.overview,
      studentOverview: @lesson.student_overview,
      assessment: @lesson.assessment,
      unplugged: @lesson.unplugged,
      lockable: @lesson.lockable,
      creativeCommonsLicense: @lesson.creative_commons_license,
      purpose: @lesson.purpose,
      preparation: @lesson.preparation,
      announcements: @lesson.announcements
    }
  end

  # PATCH/PUT /lessons/1
  def update
    @lesson.update!(lesson_params)

    redirect_to lesson_path(id: @lesson.id)
  end

  private

  def lesson_params
    # for now, only allow editing of fields that cannot be edited on the
    # script edit page.
    lp = params.permit(
      :overview,
      :studentOverview,
      :assessment,
      :unplugged,
      :creativeCommonsLicense,
      :lockable,
      :purpose,
      :preparation,
      :announcements
    ).to_h.deep_transform_keys(&:underscore)
    lp[:announcements] = JSON.parse(lp[:announcements]) if lp[:announcements]
    lp
  end
end
