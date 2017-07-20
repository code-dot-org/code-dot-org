class Api::V1::SectionsController < ApplicationController
  load_resource :section, class: 'Section', find_by: :code, id_param: :section_code
  before_action :find_follower, only: :leave
  load_resource

  # POST /api/v1/sections/<section_code>/join
  def join
    @section.add_student current_user
    render json: {
      sections: current_user.sections_as_student.map(&:summarize)
    }
  end

  # POST /api/v1/sections/<section_code>/leave
  def leave
    authorize! :destroy, @follower
    @section.remove_student(current_user, @follower, {notify: true})
    render json: {
      sections: current_user.sections_as_student.map(&:summarize)
    }
  end

  private

  def find_follower
    raise "No user signed in" unless current_user
    @follower = Follower.where(section: @section.id, student_user_id: current_user.id).first
  end
end
