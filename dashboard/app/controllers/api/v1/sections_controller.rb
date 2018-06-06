class Api::V1::SectionsController < Api::V1::JsonApiController
  load_resource :section, find_by: :code, only: [:join, :leave]
  before_action :find_follower, only: :leave
  load_and_authorize_resource except: [:join, :leave, :membership, :valid_scripts]

  skip_before_action :verify_authenticity_token, only: :update_sharing_disabled

  rescue_from ActiveRecord::RecordNotFound do |e|
    if e.model == "Section" && %w(join leave).include?(request.filtered_parameters['action'])
      render json: {
        result: 'section_notfound'
      }, status: :bad_request
    else
      head :forbidden
    end
  end

  # GET /api/v1/sections
  # Get the set of sections owned by the current user
  def index
    render json: current_user.sections.map(&:summarize)
  end

  # GET /api/v1/sections/<id>
  # Get complete details of a particular section
  def show
    render json: @section.summarize
  end

  # POST /api/v1/sections
  # Create a new section
  def create
    return head :bad_request unless Section.valid_login_type?(@section.login_type)

    @section.name = 'New Section' if @section.name.nil_or_empty?
    @section.user = current_user
    @section.course_id = nil unless Course.valid_course_id?(@section.course_id)
    @section.script_id = nil unless Script.valid_script_id?(@section.user, @section.script_id)

    if @section.save
      render json: @section.summarize
    else
      render json: @section.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/sections/<id>
  # Delete a section
  def destroy
    @section.destroy
    head :no_content
  end

  # POST /api/v1/sections/<id>/join
  def join
    unless current_user
      render_404
      return
    end
    result = @section.add_student current_user
    render json: {
      sections: current_user.sections_as_student.map(&:summarize),
      result: result
    }
  end

  # POST /api/v1/sections/<id>/leave
  def leave
    authorize! :destroy, @follower
    @section.remove_student(current_user, @follower, {notify: true})
    render json: {
      sections: current_user.sections_as_student.map(&:summarize),
      result: "success"
    }
  end

  def update_sharing_disabled
    @section.update!(sharing_disabled: params[:sharing_disabled])
    @section.update_student_sharing(params[:sharing_disabled])
    render json: {
      sharing_disabled: @section.sharing_disabled,
      students: @section.students.map(&:summarize)
    }
  end

  def student_script_ids
    render json: {studentScriptIds: @section.student_script_ids}
  end

  # GET /api/v1/sections/membership
  # Get the set of sections that the current user is enrolled in.
  def membership
    return head :forbidden unless current_user
    render json: current_user.sections_as_student, each_serializer: Api::V1::SectionNameAndIdSerializer
  end

  # GET /api/v1/sections/valid_scripts
  def valid_scripts
    return head :forbidden unless current_user

    scripts = Script.valid_scripts(current_user).map(&:assignable_info)
    render json: scripts
  end

  private

  def find_follower
    unless current_user
      render_404
      return
    end
    @follower = Follower.where(section: @section.id, student_user_id: current_user.id).first
  end

  def section_params
    params.require(:section).permit(
      :name,
      :course_id,
      :script_id,
      :login_type,
      :stage_extras,
      :pairing_allowed,
      :hidden,
      :grade,
    )
  end
end
