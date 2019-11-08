class Api::V1::SectionLibrariesController < Api::V1::JsonApiController
  check_authorization

  # gets the libraries from all members of all sections I am a part of
  # GET api/v1/libraries/classmates/all
  def get_classmate_published_libraries
    sections = current_user.sections + current_user.sections_as_student
    projects = []
    sections.each do |section|
      authorize! :list_projects, section
      projects += ProjectsList.fetch_section_libraries(section)
    end
    render json: projects
  end
end
