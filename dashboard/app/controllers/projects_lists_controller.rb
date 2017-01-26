class ProjectsListsController < ApplicationController
  load_and_authorize_resource :section

  def index
    @projects_list_data = ProjectsList.fetch_section_projects(@section)
  end
end
