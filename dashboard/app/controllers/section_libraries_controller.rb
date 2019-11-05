class SectionLibrariesController < ApplicationController
  # check_authorization

  # gets the libraries from all members/owners of all sections I am a part of
  # GET api/libraries/section/all
  def get_all_section_projects
    # authorize! :list_projects
    render json: LibrariesList.fetch_all_section_projects
  end
end
