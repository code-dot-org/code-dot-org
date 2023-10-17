class Api::V1::SectionsController < Api::V1::JSONApiController
  load_resource :section, find_by: :code, only: [:join, :leave]
  before_action :find_follower, only: :leave
  load_and_authorize_resource except: [:join, :leave, :membership, :valid_course_offerings, :create, :update, :require_captcha]
  before_action :get_course_and_unit, only: [:create, :update]

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
    prevent_caching
    render json: current_user.sections.map(&:summarize_without_students)
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
    return head :bad_request unless Section.valid_participant_type? params[:participant_type]

    if @course || @unit
      participant_audience = @course ? @course.participant_audience : @unit.participant_audience
      return head :forbidden unless Section.can_be_assigned_course?(participant_audience, params[:participant_type])
    end

    # If the new grades field exists, it takes precedence.
    grades = if Section.valid_grades?(params[:grades] || [])
               params[:grades]
             elsif Section.valid_grades?([params[:grade].to_s])
               [params[:grade].to_s]
             end

    section = Section.create(
      {
        user_id: current_user.id,
        name: params[:name].present? ? params[:name].to_s : I18n.t('sections.default_name', default: 'Untitled Section'),
        login_type: params[:login_type],
        participant_type: params[:participant_type],
        grades: grades,
        script_id: @unit&.id,
        course_id: @course&.id,
        lesson_extras: params['lesson_extras'] || false,
        pairing_allowed: params[:pairing_allowed].nil? ? true : params[:pairing_allowed],
        tts_autoplay_enabled: params[:tts_autoplay_enabled].nil? ? false : params[:tts_autoplay_enabled],
        restrict_section: params[:restrict_section].nil? ? false : params[:restrict_section]
      }
    )
    return head :bad_request unless section.persisted?

    # TODO: Move to an after_create step on Section model when old API is fully deprecated
    current_user.assign_script @unit if @unit

    render json: section.summarize
  end

  # Allows you to update a section. Clears any assigned script_id in the process
  def update
    section = Section.find(params[:id])
    authorize! :manage, section

    # Unhide unit for this section before assigning
    section.toggle_hidden_script @unit, false if @unit

    if @course || @unit
      participant_audience = @course ? @course.participant_audience : @unit.participant_audience
      return head :forbidden unless Section.can_be_assigned_course?(participant_audience, section.participant_type)
    end

    # TODO: (madelynkasula) refactor to use strong params
    fields = {}
    fields[:course_id] = @course&.id
    fields[:script_id] = @unit&.id
    fields[:name] = params[:name] if params[:name].present?
    fields[:login_type] = params[:login_type] if Section.valid_login_type?(params[:login_type])
    fields[:grades] = [params[:grade]] if Section.valid_grades?([params[:grade]])
    # If the new grades field exists, it takes precedence.
    fields[:grades] = params[:grades] if Section.valid_grades?(params[:grades] || [])
    fields[:lesson_extras] = params[:lesson_extras] unless params[:lesson_extras].nil?
    fields[:pairing_allowed] = params[:pairing_allowed] unless params[:pairing_allowed].nil?
    fields[:tts_autoplay_enabled] = params[:tts_autoplay_enabled] unless params[:tts_autoplay_enabled].nil?
    fields[:hidden] = params[:hidden] unless params[:hidden].nil?
    fields[:restrict_section] = params[:restrict_section] unless params[:restrict_section].nil?

    section.update!(fields)
    if @unit
      section.students.each do |student|
        student.assign_script(@unit)
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
    # add_student returns 'forbidden' when user can not be participant in section
    if result == 'forbidden'
      render json: {
        result: 'cant_be_participant'
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
      studentSections: current_user.sections_as_student_participant.map(&:summarize_without_students),
      plSections: current_user.sections_as_pl_participant.map(&:summarize_without_students),
      result: result
    }
  end

  # POST /api/v1/sections/<id>/leave
  def leave
    authorize! :destroy, @follower
    @section.remove_student(current_user, @follower, {notify: true})
    render json: {
      sections: current_user.sections_as_student.map(&:summarize_without_students),
      studentSections: current_user.sections_as_student_participant.map(&:summarize_without_students),
      plSections: current_user.sections_as_pl_participant.map(&:summarize_without_students),
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

  # GET /api/v1/sections/membership
  # Get the set of sections that the current user is enrolled in.
  def membership
    return head :forbidden unless current_user
    render json: current_user.sections_as_student, each_serializer: Api::V1::SectionNameAndIdSerializer
  end

  # GET /api/v1/sections/valid_course_offerings
  def valid_course_offerings
    return head :forbidden unless current_user

    course_offerings = CourseOffering.assignable_course_offerings_info(current_user, request.locale)
    render json: course_offerings
  end

  # GET /api/v1/sections/available_participant_types
  def available_participant_types
    return head :forbidden unless current_user && !current_user.student?

    participant_types =
      if current_user.permission?(UserPermission::PLC_REVIEWER) || current_user.permission?(UserPermission::UNIVERSAL_INSTRUCTOR) || current_user.permission?(UserPermission::LEVELBUILDER)
        [Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student, Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher, Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator]
      elsif current_user.permission?(UserPermission::FACILITATOR)
        [Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student, Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher]
      else
        [Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student]
      end

    render json: {availableParticipantTypes: participant_types}
  end

  # GET /api/v1/sections/require_captcha
  # Get the recaptcha site key for frontend and whether current user requires captcha verification
  def require_captcha
    return head :forbidden unless current_user
    site_key = CDO.recaptcha_site_key
    render json: {key: site_key}
  end

  # GET /api/v1/sections/<id>/code_review_groups
  # Get all code review groups and their members for this section. Also include
  # all unassigned followers.
  # Format is:
  # { groups: [
  #   {unassigned: true, name: 'unassigned', members: [{follower_id: 1, name: 'student_name'},...]},
  #   {id: <group-id>, name: 'group_name', members: [{follower_id: 2, name: 'student_name'},...]},
  #   ...
  # ]}
  def code_review_groups
    groups = @section.code_review_groups
    groups_details = []
    assigned_follower_ids = []
    groups.each do |group|
      members = []
      group.members.each do |member|
        members << {follower_id: member.follower_id, name: member.name}
        assigned_follower_ids << member.follower_id
      end
      groups_details << {id: group.id, name: group.name, members: members}
    end

    unassigned_students = @section.followers.where.not(id: assigned_follower_ids)
    unassigned_students = unassigned_students.map {|student| {follower_id: student.id, name: student.student_user.name}}
    groups_details << {unassigned: true, members: unassigned_students}
    render json: {groups: groups_details}
  end

  # POST /api/v1/sections/<id>/code_review_groups
  def set_code_review_groups
    @section.reset_code_review_groups(params[:groups])
    render json: {result: 'success'}
  # if the group data is invalid we will get a record invalid exception
  rescue ActiveRecord::RecordInvalid
    render json: {result: 'invalid groups'}, status: :bad_request
  end

  # POST /api/v1/sections/<id>/code_review_enabled
  def set_code_review_enabled
    # ensure a string or boolean gets parsed correctly
    enable_code_review = ActiveModel::Type::Boolean.new.cast(params[:enabled])
    @section.update_code_review_expiration(enable_code_review)
    @section.save
    render json: {result: 'success', expiration: @section.code_review_expires_at}
  end

  private def find_follower
    unless current_user
      render_404
      return
    end
    @follower = Follower.where(section: @section.id, student_user_id: current_user.id).first
  end

  private def get_course_and_unit
    return head :forbidden if current_user.nil?

    if params[:course_version_id]
      course_version = CourseVersion.find_by_id(params[:course_version_id])
      return head :bad_request unless course_version

      case course_version.content_root_type
      when 'UnitGroup'
        course_id = course_version.content_root_id
        @course = UnitGroup.get_from_cache(course_id)
        return head :bad_request unless @course
        return head :forbidden unless @course.course_assignable?(current_user)
        @unit = params[:unit_id] ? Unit.get_from_cache(params[:unit_id]) : nil
        return head :bad_request if @unit && @course.id != @unit.unit_group.try(:id)
      when 'Unit'
        unit_id = course_version.content_root_id
        @unit = Unit.get_from_cache(unit_id)
        return head :bad_request unless @unit
        return head :forbidden unless @unit.course_assignable?(current_user)
      end
    else
      # Should not get a unit_id unless also get a course version which is course
      return head :bad_request if params[:unit_id]
    end
  end
end
