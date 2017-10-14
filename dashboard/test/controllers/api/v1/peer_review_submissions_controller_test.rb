require 'test_helper'

class Api::V1::PeerReviewSubmissionsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @course_unit = create :plc_course_unit
    @level_1, @level_2, @level_3, @level_4 = create_list :free_response, 4, peer_reviewable: true

    [@level_1, @level_2, @level_3, @level_4].each do |level|
      create :script_level, script: @course_unit.script, levels: [level]
    end

    @submitter = create :teacher
    create :plc_user_course_enrollment, user: @submitter, plc_course: @course_unit.plc_course
    reviewer = create :teacher

    [@level_1, @level_2, @level_3, @level_4].each do |level|
      create_peer_reviews_for_user_and_level(@submitter, level)
    end

    @escalated_reviews = PeerReview.where(level: @level_1)
    @escalated_reviews.first.update(status: :escalated, reviewer: nil)
    @escalated_reviews.second.update(status: :escalated, reviewer: reviewer)

    PeerReview.where(level: @level_2).second.update(status: :accepted, reviewer: reviewer)
    PeerReview.where(level: @level_3).update(status: :accepted, reviewer: reviewer)

    @level_2_reviews = PeerReview.where(level: @level_2)
    @level_3_reviews = PeerReview.where(level: @level_3)
    @level_4_reviews = PeerReview.where(level: @level_4)

    @plc_reviewer = create :plc_reviewer

    assert_equal 8, PeerReview.count
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
      level_name: @level_1.name,
      review_ids: [[@escalated_reviews.first.id, 'escalated'], [@escalated_reviews.second.id, 'escalated']],
      status: 'escalated',
      accepted_reviews: 0,
      rejected_reviews: 0,
      escalated_review_id: @escalated_reviews.first.id,
    }.stringify_keys]
    assert_equal expected_response, response.map {|r| r.except('submission_date', 'escalation_date')}
  end

  test 'Open peer reviews gets open peer reviews submissions' do
    get :index, params: {filter: 'open'}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal [
      [[@escalated_reviews.first.id, 'escalated'], [@escalated_reviews.second.id, 'escalated']],
      [[@level_2_reviews.first.id, nil], [@level_2_reviews.second.id, 'accepted']],
      [[@level_4_reviews.first.id, nil], [@level_4_reviews.second.id, nil]],
    ], response.map {|submission| submission['review_ids']}
  end

  test 'Open peer reviews with email filter only gets those peer reviews' do
    # Create some for another submitter
    other_submitter = create :teacher
    create_peer_reviews_for_user_and_level(other_submitter, @level_4)
    submissions = PeerReview.where(level: @level_4, submitter: other_submitter)

    get :index, params: {filter: 'open', email: other_submitter.email}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal [
      [[submissions.first.id, nil], [submissions.second.id, nil]]
    ], response.map {|submission| submission['review_ids']}
  end

  test 'All peer reviews gets all peer reviews submissions' do
    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal [
      [[@escalated_reviews.first.id, 'escalated'], [@escalated_reviews.second.id, 'escalated']],
      [[@level_2_reviews.first.id, nil], [@level_2_reviews.second.id, 'accepted']],
      [[@level_3_reviews.first.id, 'accepted'], [@level_3_reviews.second.id, 'accepted']],
      [[@level_4_reviews.first.id, nil], [@level_4_reviews.second.id, nil]],
    ], response.map {|submission| submission['review_ids']}
  end

  [:admin, :teacher, :facilitator, :student].each do |user|
    test_user_gets_response_for(
      :index,
      user: user,
      response: user == :admin ? :success : :forbidden
    )
  end

  test 'Peer Review report returns expected columns' do
    create :peer_review, reviewer: @submitter, script: @course_unit.script
    create :peer_review, reviewer: @submitter

    get :report_csv, params: {plc_course_unit_id: @course_unit.id}

    assert_response :success
    response = CSV.parse(@response.body)

    expected_headers = ['Name', 'Email']
    expected_headers << [@level_1, @level_2, @level_3, @level_4].map do |level|
      [level.name.titleize, "#{level.name.titleize} Submit Date"]
    end
    expected_headers << 'Reviews Performed'

    date = Time.now.utc.strftime("%-m/%-d/%Y")

    assert_equal [
      expected_headers.flatten,
      [@submitter.name, @submitter.email, 'Unsubmitted', date, 'Unsubmitted', date, 'Accepted', date, 'Unsubmitted', date, '1']
    ], response
  end

  # Make sure that teachers, facilitators and students cannot get this report
  [:teacher, :facilitator, :student].each do |user|
    test_user_gets_response_for(
      :report_csv,
      params: {plc_course_unit_id: 1},
      user: user,
      response: :forbidden
    )
  end

  private

  def create_peer_reviews_for_user_and_level(user, level)
    level_source = create :level_source, level: level
    create :user_level, user: user, level: level, level_source: level_source
    2.times do
      PeerReview.create(submitter: user, script: @course_unit.script, level: level, data: nil, level_source_id: level_source.id)
    end
  end
end
