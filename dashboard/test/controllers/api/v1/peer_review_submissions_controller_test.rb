require 'test_helper'

class Api::V1::PeerReviewSubmissionsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @course_unit = create :plc_course_unit
    @level_1 = create :free_response, peer_reviewable: true
    @level_2 = create :free_response, peer_reviewable: true
    @level_3 = create :free_response, peer_reviewable: true

    [@level_1, @level_2, @level_3].each do |level|
      create :script_level, script: @course_unit.script, levels: [level]
    end

    @submitter = create :teacher
    reviewer = create :teacher

    [@level_1, @level_2, @level_3].each do |level|
      2.times do
        create :peer_review, submitter: @submitter, script: @course_unit.script, level: level, data: nil
      end
    end

    PeerReview.where(level: @level_1).update(status: :escalated)
    PeerReview.where(level: @level_2).update(status: :accepted, reviewer: reviewer)

    @plc_reviewer = create :plc_reviewer
  end

  setup do
    sign_in(@plc_reviewer)
  end

  test 'Escalated peer reviews gets expected peer_reviews' do
    get :index, params: {filter: 'escalated'}
    assert_response :success
    response = JSON.parse(@response.body)
    expected_response = [{
      submitter: @submitter.name,
      course_name: @course_unit.plc_course.name,
      unit_name: @course_unit.name,
      level_name: @level_1.name
    }.stringify_keys]
    assert_equal expected_response, response.map {|r| r.reject {|k, _| ['submission_date', 'escalation_date', 'review_id'].include? k}}
  end

  test 'Open peer reviews gets open peer reviews' do
    get :index, params: {filter: 'open'}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 2, response.size
  end

  test 'All peer reviews gets all peer reviews' do
    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 3, response.size
  end

  [:admin, :teacher, :facilitator, :student].each do |user|
    test_user_gets_response_for(
      :index,
      user: user,
      response: user == :admin ? :success : :forbidden
    )
  end
end
