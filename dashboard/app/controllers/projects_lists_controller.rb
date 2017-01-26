class ProjectsListsController < ApplicationController
  include LevelsHelper

  def index
    section_id = params[:section_id]
    section_owner_id = Section.find(section_id).user_id
    raise "section can only be accessed by its owner" unless current_user && current_user.id == section_owner_id

    @projects_list_data = ProjectsList.fetch_section_projects(section_id)
  end
end
