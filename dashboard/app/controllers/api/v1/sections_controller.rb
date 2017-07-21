class Api::V1::SectionsController < Api::V1::JsonApiController
  load_and_authorize_resource

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

  # POST /api/v1/sections
  # Create a new section
  def create
    # TODO: Push validation into model?
    return head :bad_request unless Section.valid_login_type? params[:login_type]

    valid_script = params[:script] && valid_script_id?(params[:script][:id])
    script_to_assign = valid_script && Script.find(params[:script][:id])

    section = Section.create!(
      {
        user_id: current_user.id,
        name: !params[:name].to_s.empty? ? params[:name].to_s : 'New Section',
        login_type: params[:login_type],
        grade: Section.valid_grade?(params[:grade].to_s) ? params[:grade].to_s : nil,
        script_id: script_to_assign ? script_to_assign.id : params[:script_id],
        course_id: params[:course_id] && valid_course_id?(params[:course_id]) ?
          params[:course_id].to_i : nil,
        code: CodeGeneration.random_unique_code(length: 6),
        stage_extras: params[:stage_extras] ? params[:stage_extras] : false,
        pairing_allowed: params[:pairing_allowed].nil? ? true : params[:pairing_allowed]
      }
    )

    # TODO: Move to an after_create step on Section model?
    if script_to_assign
      current_user.assign_script script_to_assign
    end

    render json: section.summarize
  end

  # @param script_id [String] id of the course we're checking the validity of
  # @return [Course|nil] The valid course if we have one, otherwise nil
  def valid_course_id?(course_id)
    Course.valid_courses.find {|course| course[:id] == course_id.to_i}
  end

  # @param script_id [String] id of the script we're checking the validity of
  # @return [Script|nil] The valid script if we have one, otherwise nil
  def valid_script_id?(script_id)
    Script.valid_scripts(current_user).find {|script| script[:id] == script_id.to_i}
  end
end
