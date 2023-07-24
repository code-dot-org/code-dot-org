class CurriculumCatalogController < ApplicationController
  # GET /catalog
  def index
    view_options(full_width: true, responsive_content: true, no_padding_container: true)

    locale_str = locale.to_s
    language_info = Dashboard::Application::LOCALES.select {|locale_code, data| data.is_a?(Hash) && locale_code == locale_str}[locale_str]
    @language_english_name = language_info[:english]
    @language_native_name = language_info[:native]

    @is_signed_out = current_user.nil?
    @is_teacher = current_user&.teacher?

    if @is_teacher
      @sections_for_teacher = current_user.try {|u| u.sections.all.reject(&:hidden).map(&:summarize)}
    end

    @catalog_data = {
      curriculaData: CourseOffering.assignable_published_for_students_course_offerings.sort_by(&:display_name).map {|co| co&.summarize_for_catalog(locale)},
      isEnglish: language == "en",
      languageEnglishName: @language_english_name,
      languageNativeName: @language_native_name,
      isSignedOut: @is_signed_out,
      isTeacher: @is_teacher,
      sections: @sections_for_teacher
    }
  end
end
