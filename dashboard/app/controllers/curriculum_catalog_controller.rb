class CurriculumCatalogController < ApplicationController
  # GET /catalog
  def index
    @curricula_data = CourseOffering.assignable_published_for_students_course_offerings.sort_by(&:display_name).map(&:serialize)
  end
end
