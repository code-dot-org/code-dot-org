class Api::V1::SectionLibrariesController < Api::V1::JSONApiController
  before_action :authenticate_user!
  check_authorization unless: :no_active_sections?

  # gets the libraries from all members of all active sections I am a part of
  # GET api/v1/section_libraries
  def index
    libraries = []
    active_sections.each do |section|
      authorize! :list_projects, section
      libraries += ProjectsList.fetch_section_libraries(section)
    end
    render json: libraries.uniq
  end

  private def no_active_sections?
    active_sections.empty?
  end

  private def active_sections
    sections = current_user.sections_instructed + current_user.sections_as_student
    sections.select {|section| !section.hidden}
  end
end
