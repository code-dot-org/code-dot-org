require 'test_helper'

class Api::V1::Pd::WorkshopSurveyReportControllerTest < ::ActionController::TestCase
  setup do
    @facilitator = create :facilitator
    @organizer = create :workshop_organizer
    @workshop = create(:pd_workshop, organizer: @organizer, facilitators: [@facilitator])
    AWS::S3.stubs(:download_from_bucket).returns(Hash[@workshop.course.to_sym, {}].to_json)
  end

  API = '/api/v1/pd/workshops'

  test 'admins can view surveys' do
    admin = create :admin

    sign_in admin

    get :workshop_survey_report, params: {workshop_id: @workshop.id}
    assert_response :success
  end

  test 'facilitators can view their survey' do
    sign_in @facilitator
    get :workshop_survey_report, params: {workshop_id: @workshop.id}
    assert_response :success

    @controller = ::Api::V1::Pd::WorkshopSurveyReportController.new

    other_facilitator = create :facilitator
    other_workshop = create(:pd_workshop, organizer: @organizer, facilitators: [other_facilitator])
    get :workshop_survey_report, params: {workshop_id: other_workshop.id}
    assert_response :forbidden
  end

  test "non-facilitator teachers cannot view surveys" do
    teacher = create :teacher
    sign_in teacher

    get :workshop_survey_report, params: {workshop_id: @workshop.id}
    assert_response :forbidden
  end
end
