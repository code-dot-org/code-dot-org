class Api::V1::SectionsController < Api::V1::JsonApiController
  load_resource :section, find_by: :code, only: [:join, :leave]
  before_action :find_follower, only: :leave
  load_and_authorize_resource except: [:join, :leave, :membership, :valid_scripts, :create, :update, :require_captcha]

  skip_before_action :verify_authenticity_token, only: [:update_sharing_disabled, :update]

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
    authorize! :create, Section

    # TODO: Push validation into model when old API is fully deprecated
    # Once this has been done, endpoint can use CanCan load_and_authorize_resource
    # rather than manually authorizing (above)
    return head :bad_request unless Section.valid_login_type? params[:login_type]

    valid_script = params[:script] && Script.valid_script_id?(current_user, params[:script][:id])
    script_to_assign = valid_script && Script.get_from_cache(params[:script][:id])

    section = Section.create(
      {
        user_id: current_user.id,
        name: params[:name].present? ? params[:name].to_s : I18n.t('sections.default_name', default: 'Untitled Section'),
        login_type: params[:login_type],
        grade: Section.valid_grade?(params[:grade].to_s) ? params[:grade].to_s : nil,
        script_id: script_to_assign ? script_to_assign.id : params[:script_id],
        course_id: params[:course_id] && UnitGroup.valid_course_id?(params[:course_id]) ?
          params[:course_id].to_i : nil,
        lesson_extras: params['lesson_extras'] || false,
        pairing_allowed: params[:pairing_allowed].nil? ? true : params[:pairing_allowed],
        tts_autoplay_enabled: params[:tts_autoplay_enabled].nil? ? false : params[:tts_autoplay_enabled],
        restrict_section: params[:restrict_section].nil? ? false : params[:restrict_section]
      }
    )
    render head :bad_request unless section

    # TODO: Move to an after_create step on Section model when old API is fully deprecated
    if script_to_assign
      current_user.assign_script script_to_assign
    end

    render json: section.summarize
  end

  # Allows you to update a section. Clears any assigned script_id in the process
  def update
    section = Section.find(params[:id])
    authorize! :manage, section

    course_id = params[:course_id]

    # This endpoint needs to satisfy two endpoint formats for getting script_id
    # This should be updated soon to always expect params[:script_id]
    script_id = params[:script][:id] if params[:script]
    script_id ||= params[:script_id]

    if script_id
      script = Script.get_from_cache(script_id)
      return head :bad_request if script.nil?
      # If given a course and script, make sure the script is in that course
      return head :bad_request if course_id && course_id != script.unit_group.try(:id)
      # If script has a course and no course_id was provided, use default course
      course_id ||= script.unit_group.try(:id)
      # Unhide script for this section before assigning
      section.toggle_hidden_script script, false
    end

    # TODO: (madelynkasula) refactor to use strong params
    fields = {}
    fields[:course_id] = set_course_id(course_id)
    fields[:script_id] = set_script_id(script_id)
    fields[:name] = params[:name] if params[:name].present?
    fields[:login_type] = params[:login_type] if Section.valid_login_type?(params[:login_type])
    fields[:grade] = params[:grade] if Section.valid_grade?(params[:grade])
    fields[:lesson_extras] = params[:lesson_extras] unless params[:lesson_extras].nil?
    fields[:pairing_allowed] = params[:pairing_allowed] unless params[:pairing_allowed].nil?
    fields[:tts_autoplay_enabled] = params[:tts_autoplay_enabled] unless params[:tts_autoplay_enabled].nil?
    fields[:hidden] = params[:hidden] unless params[:hidden].nil?
    fields[:restrict_section] = params[:restrict_section] unless params[:restrict_section].nil?

    section.update!(fields)
    if script_id
      section.students.each do |student|
        student.assign_script(script)
      end
    end
    render json: section.summarize
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
    # add_student returns 'failure' when id of current user is owner of @section
    if result == 'failure'
      render json: {
        result: 'section_owned'
      }, status: :bad_request
      return
    end
    # add_student returns 'full' when @section has or will have 500 followers
    if result == 'full'
      render json: {
        result: 'section_full'
      }, status: :forbidden
      return
    end
    # add_student returns 'full' when @section has or will have 500 followers
    if result == 'full'
      render json: {
          result: 'section_full',
          sectionCapacity: @section.capacity
      }, status: :forbidden
      return
    end
    # add_student returns 'restricted' when @section is flagged to restrict access
    if result == 'restricted'
      render json: {
        result: 'section_restricted'
      }, status: :forbidden
      return
    end
    render json: {
      sections: current_user.sections_as_student.map(&:summarize_without_students),
      result: result
    }
  end

  # POST /api/v1/sections/<id>/leave
  def leave
    authorize! :destroy, @follower
    @section.remove_student(current_user, @follower, {notify: true})
    render json: {
      sections: current_user.sections_as_student.map(&:summarize_without_students),
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

  # GET /api/v1/sections/require_captcha
  # Get the recaptcha site key for frontend and whether current user requires captcha verification
  def require_captcha
    return head :forbidden unless current_user
    site_key = CDO.recaptcha_site_key
    render json: {key: site_key}
  end

  private

  def find_follower
    unless current_user
      render_404
      return
    end
    @follower = Follower.where(section: @section.id, student_user_id: current_user.id).first
  end

  # Update script_id if user provided valid script_id
  # Set script_id to nil if invalid or no script_id provided
  def set_script_id(script_id)
    return script_id if Script.valid_script_id?(current_user, script_id)
    nil
  end

  # Update course_id if user provided valid course_id
  # Set course_id to nil if invalid or no course_id provided
  def set_course_id(course_id)
    return course_id if UnitGroup.valid_course_id?(course_id)
    nil
  end
end
