class TransfersController < ApplicationController
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token

  # POST /sections/:id/transfers
  def create
    new_section_code = params[:new_section_code]
    current_section_code = params[:current_section_code]
    unless new_section_code && current_section_code
      return head :bad_request
    end

    stay_enrolled_in_current_section = params[:stay_enrolled_in_current_section].try(:to_bool)
    if stay_enrolled_in_current_section.nil?
      return head :bad_request
    end

    student_ids = params[:student_ids].try(:split, ',').try(:map, &:to_i)
    if student_ids.nil? || student_ids.empty?
      render json: {
        error: I18n.t('move_students.student_ids_not_entered')
      }, status: :bad_request
      return
    end

    # Rather than noop, we return a bad_request if the source and destination sections are the same.
    if new_section_code == current_section_code
      render json: {
        error: I18n.t('move_students.section_code_cant_be_current_section')
      }, status: :bad_request
      return
    end
    # Verify the destination section and destination teacher exist (are not soft-deleted).
    new_section = Section.find_by_code(new_section_code)
    unless new_section && new_section.user
      render json: {
        error: I18n.t('move_students.new_section_dne', new_section_code: new_section_code)
      }, status: :not_found
      return
    end
    # Verify the source section exists (is not soft-deleted).
    current_section = Section.find_by_code(current_section_code)
    unless current_section
      render json: {
        error: I18n.t('move_students.current_section_dne', current_section_code: current_section_code)
      }, status: :not_found
      return
    end

    # TODO(asher): Determine if this should be :manage (currently not granted) instead of :read.
    authorize! :read, current_section

    students = User.where(id: student_ids).all
    if students.count != student_ids.count
      render json: {
        error: I18n.t('move_students.student_not_found')
      }, status: :not_found
      return
    end

    if student_ids.count != current_user.followers.where(section_id: current_section.id, student_user_id: student_ids).count
      render json: {
        error: I18n.t('move_students.all_students_must_be_in_current_section')
      }, status: :forbidden
      return
    end

    if students.any? {|student| Follower.exists?(section: new_section, student_user: student)}
      render json: {
        error: I18n.t('move_students.already_enrolled_in_new_section')
      }, status: :bad_request
      return
    end

    stay_enrolled_in_current_section = params[:stay_enrolled_in_current_section] &&
      params[:stay_enrolled_in_current_section] != 'false'
    students.each do |student|
      if new_section.user == current_user
        follower_same_user_teacher = student.followeds.find_by_section_id(current_section.id)
        follower_same_user_teacher.update_attributes!(section_id: new_section.id)
      else
        unless student.followeds.exists?(section_id: new_section.id)
          student.followeds.create!(user: new_section.user, section: new_section)
        end

        unless stay_enrolled_in_current_section
          student.followeds.find_by_section_id(current_section.id).destroy
        end
      end

      student.assign_script(new_section.script) if new_section.script
    end

    render json: {}, status: :no_content
  end
end
