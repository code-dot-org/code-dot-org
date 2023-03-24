class CurriculumCatalogController < ApplicationController
  # GET /catalog
  def index
    @curricula_data = assignable_published_for_students_course_offerings.sort_by(&:display_name).map(&:serialize)
  end

  # We only want course offerings that are:
  # - Assignable (course offering 'assignable' setting is true)
  # - Published (associated unit group or unit 'published_state' setting is 'preview' or 'stable')
  # - For students (associated unit group or unit 'participant_audience' setting is student)
  private def assignable_published_for_students_course_offerings
    CourseOffering.all.select {|co| co.assignable? && co.any_version_is_in_published_state? && co.get_participant_audience == 'student'}
  end
end
