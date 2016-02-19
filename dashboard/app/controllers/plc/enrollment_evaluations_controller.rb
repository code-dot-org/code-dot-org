class Plc::EnrollmentEvaluationsController < ApplicationController
  def perform_evaluation
    @plc_user_course_enrollment = Plc::UserCourseEnrollment.find(params[:enrollment_id])
    @questions = @plc_user_course_enrollment.plc_course.plc_evaluation_questions.all
    @user = @plc_user_course_enrollment.user
    @course = @plc_user_course_enrollment.plc_course
  end

  def submit_evaluation
    question_responses = params[:answerTaskList].split(',')
    user_professional_learning_course_enrollment = Plc::UserCourseEnrollment.find(params[:enrollment_id])

    modules_to_enroll_in = Plc::Task.where(id: question_responses).map(&:plc_learning_module)

    user_professional_learning_course_enrollment.enroll_user_in_course_with_learning_modules(modules_to_enroll_in)
    redirect_to controller: :user_course_enrollments, action: :show, id: params[:enrollment_id]
  end
end
