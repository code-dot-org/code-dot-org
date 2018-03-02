require 'test_helper'

class Api::V1::Pd::CourseFacilitatorsControllerTest < ::ActionController::TestCase
  {
    admin: :success,
    workshop_organizer: :success,
    facilitator: :success,
    program_manager: :success,
    teacher: :forbidden
  }.each do |user_type, response|
    test_user_gets_response_for(
      :index,
      user: user_type,
      response: response,
      params: {course: Pd::Workshop::COURSES.first}
    )
  end
end
