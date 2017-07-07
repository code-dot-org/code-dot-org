class Pd::WorkshopUserAdminController < ApplicationController
  authorize_resource class: :pd_workshop_user_admin

  # display the Facilitator search form, Facilitators found, and Courses for first Facilitator found
  # assign / remove Courses actions redirect back to this form to display the updated course list
  def facilitator_courses_form
    search_term = facilitator_course_params[:search_term]
    if search_term =~ /^\d+$/
      facilitator_id = search_term
      @facilitators = User.where(id: facilitator_id)
    elsif search_term
      email = search_term
      hashed_email = User.hash_email(email)
      @facilitators = User.where(hashed_email: hashed_email)
    end
    @facilitator = @facilitators.first if @facilitators
    @courses = Pd::CourseFacilitator.where(facilitator_id: @facilitator.id)
  end

  def assign_course
    facilitator_id = facilitator_course_params[:facilitator_id]
    course = facilitator_course_params[:course]
    Pd::CourseFacilitator.create(facilitator_id: facilitator_id, course: course)
    redirect_to action: "facilitator_courses_form", search_term: facilitator_id
  end

  def remove_course
    facilitator_id = facilitator_course_params[:facilitator_id]
    course_facilitator_id = facilitator_course_params[:course_facilitator_id]
    facilitator_course = Pd::CourseFacilitator.find(course_facilitator_id)
    facilitator_course.destroy
    redirect_to action: "facilitator_courses_form", search_term: facilitator_id
  end

  private

  # white list permitted request parameters
  def facilitator_course_params
    params.permit(:search_term, :facilitator_id, :course, :course_facilitator_id)
  end
end
