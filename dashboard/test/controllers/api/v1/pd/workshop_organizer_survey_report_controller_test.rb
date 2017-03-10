require 'test_helper'

class Api::V1::Pd::WorkshopOrganizerSurveyReportControllerTest < ::ActionController::TestCase
  setup do
    @course = Pd::Workshop::COURSES.first
    AWS::S3.stubs(:download_from_bucket).returns(Hash[@course.to_sym, {}].to_json)
  end

  generate_user_tests_for :index, user: [:admin, :workshop_organizer], params: -> {{course: @course}}
  generate_user_tests_for :index, response: :forbidden, user: :teacher, params: -> {{course: @course}}
end
