class TransfersController < ApplicationController
  before_filter :authenticate_user!
  # check_authorization

  # TODO: Copying Progress
  # TODO: some permitting required?
  # POST /section/:section_id/transfers
  def create
    new_section_id = params[:section_id]

    # TODO: Throw error when student_ids not passed in
    student_ids = params[:student_ids].split(',').map(&:to_i)

    if !Section.exists?(new_section_id)
      # TODO: i18n
      # TODO: How do we render this?
      # render json: "Section does not exist", status: :unprocessable_entity
      # return
    end

    if !User.exists?(id: student_ids)
      # TODO: i18n
      # TODO: How do we render this?
      # render json: "One or more students does not exist", status: :unprocessable_entity
      # return
    end

    students = User.where(id: student_ids)
    # students.each do |student|
      # if !student.can_transfer_to(new_section)
      # end
    # end

    section = Section.find_by_id(new_section_id)

    # mass update students
    # TODO: I plan to optimize this so 2 db calls are required instead of N
    students.each do |student|
      follower_same_user_teacher = student.followeds.find_by_user_id(section.user_id)
      if follower_same_user_teacher.present?
        follower_same_user_teacher.update_attributes!(:section_id => section.id)
      else
        Follower.create!(user_id: section.user_id, student_user: current_user, section: section)
      end

      # assign_script for each student
      student.assign_script(section.script) if section.script
    end

    # TODO: Render some type of successful json
    # head :no_content
  end
end
