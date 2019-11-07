class SectionLibrariesController < ApplicationController
  # gets the libraries from all members of all sections I am a part of
  # GET api/libraries/section/all
  def get_all_section_projects
    render json: LibrariesList.fetch_all_section_projects(current_user)
  end
end
