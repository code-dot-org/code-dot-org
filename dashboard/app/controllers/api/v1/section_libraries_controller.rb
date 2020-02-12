class Api::V1::SectionLibrariesController < Api::V1::JsonApiController
  before_action :authenticate_user!
  check_authorization

  # gets the libraries from all members of all sections I am a part of
  # GET api/v1/section_libraries
  def index
    sections = current_user.sections + current_user.sections_as_student
    libraries = []
    sections.each do |section|
      authorize! :list_projects, section
      libraries += ProjectsList.fetch_section_libraries(section)
    end
    render json: libraries.uniq
  end
end
