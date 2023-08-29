require 'test_helper'

class Api::V1::Pd::CourseFacilitatorsControllerTest < ActionController::TestCase
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

  test 'index returns unique and sorted list of facilitators' do
    facilitator1 = create :facilitator, name: 'B'
    facilitator2 = create :facilitator, name: 'A'

    create :pd_course_facilitator, facilitator: facilitator1, course: Pd::Workshop::COURSE_CSF
    create :pd_course_facilitator, facilitator: facilitator2, course: Pd::Workshop::COURSE_CSF
    create :pd_course_facilitator, facilitator: facilitator2, course: Pd::Workshop::COURSE_CSD

    sign_in create(:workshop_organizer)
    get :index
    assert_response :success
    response_body = JSON.parse(response.body)
    assert_equal [facilitator2, facilitator1].map(&:email), response_body.map {|f| f['email']}
  end
end
