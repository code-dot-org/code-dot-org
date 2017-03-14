require 'test_helper'

class Api::V1::Pd::WorkshopOrganizerSurveyReportControllerTest < ::ActionController::TestCase
  setup do
    @organizer = create :workshop_organizer
    @workshop = create(:pd_workshop, organizer: @organizer)
    AWS::S3.stubs(:download_from_bucket).returns(Hash[@workshop.course.to_sym, {}].to_json)
  end

  API = '/api/v1/pd/workshops'

  test 'admins can view surveys' do
    admin = create :admin

    sign_in admin

    get :index, params: {course: Pd::Workshop::COURSES.first}
    assert_response :success
  end

  test 'organizers can view surveys' do
    sign_in @organizer
    get :index, params: {course: Pd::Workshop::COURSES.first}
    assert_response :success
  end

  test "teachers who are not organizers cannot view surveys" do
    teacher = create :teacher
    sign_in teacher

    get :index, params: {course: Pd::Workshop::COURSES.first}
    assert_response :forbidden
  end
end
