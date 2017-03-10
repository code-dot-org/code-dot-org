require 'test_helper'

class Api::V1::Pd::CourseFacilitatorsControllerTest < ::ActionController::TestCase
  generate_user_tests_for :index, user: [:admin, :workshop_organizer],
    response: :success, params: {course: Pd::Workshop::COURSES.first}

  generate_user_tests_for :index, user: [:facilitator, :teacher],
    response: :forbidden, params: {course: Pd::Workshop::COURSES.first}
end
