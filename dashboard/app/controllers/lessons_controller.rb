class LessonsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode, except: [:show]

  # GET /lessons/1
  def show
    @lesson_data = {
      title: @lesson.localized_title,
      overview: @lesson.overview,
      shortTitle: @lesson.short_title,
      studentOverview: @lesson.student_overview,
      assessment: @lesson.assessment,
      unplugged: @lesson.unplugged,
      lockable: @lesson.lockable,
      creativeCommonsLicense: @lesson.creative_commons_license,
      purpose: @lesson.purpose,
      preparation: @lesson.preparation,
      announcements: @lesson.lesson_announcements
    }
  end

  # GET /lessons/1/edit
  def edit
    @lesson_data = {
      id: @lesson.id,
      name: @lesson.name,
      shortTitle: @lesson.short_title,
      overview: @lesson.overview,
      studentOverview: @lesson.student_overview,
      assessment: @lesson.assessment,
      unplugged: @lesson.unplugged,
      lockable: @lesson.lockable,
      creativeCommonsLicense: @lesson.creative_commons_license,
      purpose: @lesson.purpose,
      preparation: @lesson.preparation,
      announcements: @lesson.lesson_announcements
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
      :short_title,
      :student_overview,
      :assessment,
      :unplugged,
      :creativeCommonsLicense,
      :lockable,
      :purpose,
      :preparation,
      :lesson_announcements
    )
    lp[:lesson_announcements] = JSON.parse(lp[:lesson_announcements]) if lp[:lesson_announcements]

    lp
  end
end
