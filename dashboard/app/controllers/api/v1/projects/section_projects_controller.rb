class Api::V1::Projects::SectionProjectsController < ApplicationController
  load_and_authorize_resource :section

  # GET /api/v1/projects/section/<section_id>
  def index
    render json: ProjectsList.fetch_section_projects(@section)
  end
end
