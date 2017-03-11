require 'test_helper'

class Api::V1::Pd::CourseFacilitatorsControllerTest < ::ActionController::TestCase
  test_user_gets_response_for(
    :index,
    user: [:admin, :workshop_organizer],
    response: :success,
    params: {course: Pd::Workshop::COURSES.first}
  )

  [:facilitator, :teacher].each do |user_type|
    test_user_gets_response_for(
      :index,
      user: user_type,
      response: :forbidden,
      params: {course: Pd::Workshop::COURSES.first}
    )
  end
end
