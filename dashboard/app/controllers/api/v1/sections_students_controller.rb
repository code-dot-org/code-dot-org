class Api::V1::SectionsStudentsController < ApplicationController
  layout false

  # GET /sections/<section_id>/students
  def index
    return head :forbidden unless current_user

    section = Section.find(params[:section_id])
    authorize! :manage, section
    render json: section.students
  end
end
