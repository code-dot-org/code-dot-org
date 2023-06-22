class CurriculumCatalogController < ApplicationController
  # GET /catalog
  def index
    view_options(full_width: true, responsive_content: true, no_padding_container: true)

    @is_signed_out = current_user.nil?
    @is_teacher = current_user&.teacher?

    if @is_teacher
      @sections_for_teacher = current_user.try {|u| u.sections.all.reject(&:hidden).map(&:summarize)}
    end

    @catalog_data = {
      curriculaData: CourseOffering.assignable_published_for_students_course_offerings.sort_by(&:display_name).map(&:summarize_for_catalog),
      isEnglish: language == "en",
      isSignedOut: @is_signed_out,
      isTeacher: @is_teacher,
      sections: @sections_for_teacher
    }
  end
end
