require 'test_helper'

class Api::V1::Pd::WorkshopOrganizerSurveyReportControllerTest < ::ActionController::TestCase
  setup do
    @course = Pd::Workshop::COURSES.first
    AWS::S3.stubs(:download_from_bucket).returns(Hash[@course.to_sym, {}].to_json)
  end

  [:admin, :workshop_organizer, :program_manager].each do |user_type|
    test_user_gets_response_for(
      :index,
      user: user_type,
      params: -> {{course: @course}}
    )
  end

  test_user_gets_response_for(
    :index,
    response: :forbidden,
    user: :teacher,
    params: -> {{course: @course}}
  )
end
