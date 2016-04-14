class TransfersController < ApplicationController
  before_filter :authenticate_user!
  skip_before_filter :verify_authenticity_token

  # POST /sections/:id/transfers
  def create
    new_section_code = params[:new_section_code]

    begin
      new_section = Section.find_by!(code: new_section_code)
    rescue ActiveRecord::RecordNotFound
      # TODO: i18n
      render json: {
        error: "Sorry, but that section does not exist. Please enter a different section code."
      }, status: :not_found
      return
    end

    # This is needed when we eventually allow students to be in multiple sections
    if params.has_key?(:current_section_code)
      current_section_code = params[:current_section_code]
    else
      # TODO: i18n
      render json: {
        error: "Please provide current_section_code."
      }, status: :bad_request
      return
    end

    if new_section_code == current_section_code
      # TODO: i18n
      render json: {
        error: "The current section cannot be the same as the new section."
      }, status: :bad_request
      return
    end

    begin
      current_section = Section.find_by!(code: current_section_code)
    rescue ActiveRecord::RecordNotFound
      # TODO: i18n
      render json: {
        error: "Sorry, but section #{current_section_code} does not exist. Please enter a different section code."
      }, status: :not_found
      return
    end

    if current_section.user != current_user
      # TODO: i18n
      render json: {
        error: "You cannot move students from a section that does not belong to you."
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
      # TODO: i18n
      render json: {
        error: "Please provide stay_enrolled_in_current_section."
      }, status: :bad_request
      return
    end

    if params.has_key?(:student_ids)
      student_ids = params[:student_ids].split(',').map(&:to_i)
    else
      # TODO: i18n
      render json: {
        error: "Please provide student_ids."
      }, status: :bad_request
      return
    end

    begin
      students = User.find(student_ids)
    rescue ActiveRecord::RecordNotFound
      # TODO: i18n
      render json: {
        error: "One or more students could not be found."
      }, status: :not_found
      return
    end

    if student_ids.count != current_user.followers.where(student_user_id: student_ids).count
      # TODO: i18n
      render json: {
        error: "All the students must currently be enrolled in your section."
      }, status: :forbidden
      return
    end

    if new_section.user != current_user
      new_section_teacher = new_section.user
      if students.any? {|student| Follower.exists?(student_user: student, user_id: new_section_teacher.id)}
        render json: {
          error: "You cannot move these students because this teacher already has them in another section."
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
