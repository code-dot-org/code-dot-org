require 'test_helper'

class Api::V1::PeerReviewSubmissionsControllerTest < ActionController::TestCase
  setup_all do
    @course_unit = create :plc_course_unit
    @level_1 = create :free_response
    @level_2 = create :free_response
    [@level_1, @level_2].each do |level|
      level.update(peer_reviewable: true)
      create :script_level, script: @course_unit.script, levels: [level]
    end
    @submitter = create :teacher

    [@level_1, @level_2].each do |level|
      2.times do
        create :peer_review, submitter: @submitter, script: @course_unit.script, level: level, data: nil
      end
    end
  end

  test 'Escalated peer reviews gets expected peer_reviews' do
    plc_reviewer = create :plc_reviewer
    sign_in(plc_reviewer)

    PeerReview.where(level: @level_1).update(status: :escalated)
    PeerReview.where(level: @level_2).update(status: :accepted)
    get :index_escalated
    assert_response :success
    response = JSON.parse(@response.body)
    expected_response = [{
      submitter: @submitter.name,
      course_name: @course_unit.plc_course.name,
      unit_name: @course_unit.name,
      level_name: @level_1.name
    }.stringify_keys]
    assert_equal expected_response, response.map {|r| r.reject {|k, _| ['submission_date', 'escalated_date', 'review_id'].include? k}}
  end

  [:admin, :teacher, :facilitator, :student].each do |user|
    test_user_gets_response_for(
      :index_escalated,
      user: user,
      response: user == :admin ? :success : :forbidden
    )
  end
end
