class TransfersController < ApplicationController
  before_filter :authenticate_user!
  skip_before_filter :verify_authenticity_token

  # POST /sections/:id/transfers
  def create
    new_section_code = params[:new_section_code]

    begin
      new_section = Section.find_by!(code: new_section_code)
    rescue ActiveRecord::RecordNotFound
      render json: {
        error: I18n.t('move_students.new_section_dne', new_section_code: new_section_code)
      }, status: :not_found
      return
    end

    # This is needed when we eventually allow students to be in multiple sections
    if params.has_key?(:current_section_code)
      current_section_code = params[:current_section_code]
    else
      render json: {
        error: I18n.t('move_students.section_code_not_entered')
      }, status: :bad_request
      return
    end

    if new_section_code == current_section_code
      render json: {
        error: I18n.t('move_students.section_code_cant_be_current_section')
      }, status: :bad_request
      return
    end

    begin
      current_section = Section.find_by!(code: current_section_code)
    rescue ActiveRecord::RecordNotFound
      render json: {
        error: I18n.t('move_students.current_section_dne', current_section_code: current_section_code)
      }, status: :not_found
      return
    end

    if current_section.user != current_user
      render json: {
        error: I18n.t('move_students.students_not_yours')
      }, status: :forbidden
      return
    end

    # As of right now, this only applies to transfers to another teacher
    # When students are allowed to be in multiple sections, this will also be needed
    # for transfers between the current logged-in teacher
    if new_section.user == current_user
      stay_enrolled_in_current_section = false
    elsif params.has_key?(:stay_enrolled_in_current_section)
      stay_enrolled_in_current_section = params[:stay_enrolled_in_current_section]
    else
      render json: {
        error: I18n.t('move_students.stay_enrolled_not_entered')
      }, status: :bad_request
      return
    end

    if params.has_key?(:student_ids)
      student_ids = params[:student_ids].split(',').map(&:to_i)
    else
      render json: {
        error: I18n.t('move_students.student_ids_not_entered')
      }, status: :bad_request
      return
    end

    begin
      students = User.find(student_ids)
    rescue ActiveRecord::RecordNotFound
      render json: {
        error: I18n.t('move_students.student_not_found')
      }, status: :not_found
      return
    end

    if student_ids.count != current_user.followers.where(student_user_id: student_ids).count
      render json: {
        error: I18n.t('move_students.all_students_must_be_in_current_section')
      }, status: :forbidden
      return
    end

    if new_section.user != current_user
      new_section_teacher = new_section.user
      if students.any? {|student| Follower.exists?(student_user: student, user_id: new_section_teacher.id)}
        render json: {
          error: I18n.t('move_students.already_enrolled_in_new_section')
        }, status: :bad_request
        return
      end
    end

    students.each do |student|
      if new_section.user == current_user
        follower_same_user_teacher = student.followeds.find_by_section_id(current_section.id)
        follower_same_user_teacher.update_attributes!(section_id: new_section.id)
      else
        if !student.followeds.exists?(section_id: new_section.id)
          student.followeds.create!(user_id: new_section.user_id, section: new_section)
        end

        if !stay_enrolled_in_current_section
          student.followeds.find_by_section_id(current_section.id).destroy
        end
      end

      student.assign_script(new_section.script) if new_section.script
    end

    # TODO: Email students if they're transferred to another teacher
    render json: {}, status: :no_content
  end
end
