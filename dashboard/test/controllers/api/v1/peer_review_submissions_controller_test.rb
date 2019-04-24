require 'test_helper'

class Api::V1::PeerReviewSubmissionsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @course_unit = create :plc_course_unit
    @level_1, @level_2, @level_3 = create_list :free_response, 3, peer_reviewable: true

    levels = [@level_1, @level_2, @level_3]

    levels.each do |level|
      create :script_level, script: @course_unit.script, levels: [level]
    end

    @submitter = create :teacher
    create :plc_user_course_enrollment, user: @submitter, plc_course: @course_unit.plc_course
    @teacher_reviewer = create :teacher
    create :plc_user_course_enrollment, user: @teacher_reviewer, plc_course: @course_unit.plc_course
    @plc_reviewer = create :plc_reviewer

    levels.each do |level|
      create_peer_reviews_for_user_and_level(@submitter, level)
    end

    # Accept the second review
    PeerReview.where(level: @level_2).first.update(data: 'lgtm', reviewer: @teacher_reviewer)
    PeerReview.where(level: @level_2).second.update(status: :accepted, reviewer: @plc_reviewer, from_instructor: true)

    # Perform a review for the third
    PeerReview.where(level: @level_3).first.update(data: 'lgtm', reviewer: @teacher_reviewer)

    @level_1_reviews = PeerReview.where(level: @level_1)
    @level_2_reviews = PeerReview.where(level: @level_2)
    @level_3_reviews = PeerReview.where(level: @level_3)

    @escalated_reviews = PeerReview.where(level: levels)

    assert_equal 6, PeerReview.count
  end

  setup do
    sign_in(@plc_reviewer)
  end

  test 'Peer reviews with email filter only gets those peer reviews' do
    # Create some for another submitter
    other_submitter = create :teacher
    create_peer_reviews_for_user_and_level(other_submitter, @level_3)
    submissions = PeerReview.where(level: @level_3, submitter: other_submitter)

    get :index, params: {email: other_submitter.email}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal [
      [
        [submissions.first.id, nil, submissions.first.updated_at],
        [submissions.second.id, 'escalated', submissions.second.updated_at]
      ]
    ], response['submissions'].map {|submission| submission['review_ids']}

    # Verify expected pagination metadata
    assert_equal(
      {
        "total_pages" => 1,
        "current_page" => 1
      },
      response['pagination']
    )
  end

  test 'All peer reviews gets the first page of peer reviews submissions' do
    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal [
      [
        [@level_1_reviews.first.id, nil, @level_1_reviews.first.updated_at],
        [@level_1_reviews.second.id, 'escalated', @level_1_reviews.second.updated_at]
      ],
      [
        [@level_2_reviews.first.id, nil, @level_2_reviews.first.updated_at],
        [@level_2_reviews.second.id, 'accepted', @level_2_reviews.second.updated_at]
      ],
      [
        [@level_3_reviews.first.id, nil, @level_3_reviews.first.updated_at],
        [@level_3_reviews.second.id, 'escalated', @level_3_reviews.second.updated_at]
      ],
    ], response['submissions'].map {|submission| submission['review_ids']}

    # Verify expected pagination metadata
    assert_equal(
      {
        "total_pages" => 1,
        "current_page" => 1
      },
      response['pagination']
    )
  end

  test 'can retrieve a different page of peer review results' do
    test_page_size = 5

    # Create many peer reviews to test pagination
    create_list :peer_review, 20, reviewer: @submitter, script: @course_unit.script

    get :index, params: {page: 3, per: test_page_size}
    assert_response :success
    response = JSON.parse(@response.body)

    # Verify expected number of results per page
    assert_equal test_page_size, response['submissions'].count

    # Verify expected pagination metadata
    assert_equal(
      {
        "total_pages" => 6,
        "current_page" => 3
      },
      response['pagination']
    )
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
    expected_headers << [@level_1, @level_2, @level_3].map do |level|
      [level.name.titleize, "#{level.name.titleize} Submit Date"]
    end
    expected_headers << 'Reviews Performed'

    date = Time.now.utc.strftime("%-m/%-d/%Y")

    assert_equal [
      expected_headers.flatten,
      [@submitter.name, @submitter.email, 'Pending Review', date, 'Accepted', date, 'Pending Review', date, '1'],
      [@teacher_reviewer.name, @teacher_reviewer.email, 'Unsubmitted', '', 'Unsubmitted', '', 'Unsubmitted', '', '2']
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
    user_level = create :user_level, user: user, level: level, level_source: level_source, script: @course_unit.script, best_result: ActivityConstants::UNREVIEWED_SUBMISSION_RESULT

    PeerReview.create_for_submission(user_level, level_source.id)
  end
end
