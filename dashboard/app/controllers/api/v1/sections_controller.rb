class Api::V1::SectionsController < Api::V1::JsonApiController
  load_resource :section, find_by: :code, only: [:join, :leave]
  before_action :find_follower, only: :leave
  load_and_authorize_resource except: [:join, :leave]

  # GET /api/v1/sections
  # Get the set of sections owned by the current user
  def index
    render json: @sections.map(&:summarize)
  end

  # GET /api/v1/sections/<id>
  # Get complete details of a particular section
  def show
    render json: @section.summarize
  end

  # POST /api/v1/sections/<id>/join
  def join
    @section.add_student current_user
    render json: {
      sections: current_user.sections_as_student.map(&:summarize)
    }
  end

  # POST /api/v1/sections/<id>/leave
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
