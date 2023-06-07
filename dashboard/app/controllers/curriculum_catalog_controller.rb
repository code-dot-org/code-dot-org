class CurriculumCatalogController < ApplicationController
  # GET /catalog
  def index
    view_options(full_width: true, responsive_content: true, no_padding_container: true)

    @catalog_data = {
      curriculaData: CourseOffering.assignable_published_for_students_course_offerings.sort_by(&:display_name).map {|co| co.summarize_for_catalog(locale)},
      isEnglish: language == "en"
    }
  end
end
