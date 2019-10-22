class Api::V1::Projects::SectionProjectsController < ApplicationController
  check_authorization
  load_resource :section

  # GET /api/v1/projects/section/<section_id>
  def index
    authorize! :list_projects, @section
    render json: ProjectsList.fetch_section_projects(@section)
  end
end
