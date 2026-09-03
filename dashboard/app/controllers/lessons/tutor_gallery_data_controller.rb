module Lessons
  # JSON twin of the bootstrap payload LessonsController#tutor_gallery embeds
  # in the Tutor+ gallery page, for clients that cannot read that page's
  # data attribute (e.g. a standalone dev shell). Split into its own
  # controller because LessonsController's before_action only/except lists
  # are hand-maintained, and a public action left out of one of them 403s
  # in production. The payload build below is duplicated from the page
  # action on purpose, guarded by a test, until the page stops embedding
  # the data itself.
  class TutorGalleryDataController < ApplicationController
    include ResolvesLessonFromParams

    before_action :authenticate_user!
    before_action :set_lesson
    before_action :authorize_lesson

    # GET /s/:script_name_or_id/lessons/:lesson_position/tutor/gallery_data
    # GET /courses/:course_course_name/units/:unit_position/lessons/:lesson_position/tutor/gallery_data
    def show
      unit_group = @unit_context[:unit_group] || @script.original_unit_group
      units = unit_group ? unit_group.default_units : [@script]
      sections = (current_user.sections_instructed + current_user.sections_as_student).uniq

      render json: {
        currentUnitId: @script.id,
        units: units.map.with_index(1) do |unit, position|
          {id: unit.id, name: unit.localized_title, position: position, link: unit.link}
        end,
        sections: sections.map {|section| {id: section.id, name: section.name}},
      }
    end

    private def set_lesson
      @unit_context = get_unit_context(params)
      @script = @unit_context[:unit]
      @lesson = @script.lessons.find do |l|
        l.has_lesson_plan && l.relative_position == params[:lesson_position].to_i
      end
      # A JSON client has no use for the HTML 404 page the gallery renders.
      head :not_found unless @lesson&.lesson_tutor_available?
    end

    # Class-level, the same check the page gets from load_and_authorize_resource
    # on a route with no :id. CanCanCan does not run the ability's instance
    # block for a class, so this must stay class-level to grant exactly what the
    # page grants; an instance check here would 403 users the page serves.
    private def authorize_lesson
      authorize! :tutor_gallery, Lesson
    end
  end
end
