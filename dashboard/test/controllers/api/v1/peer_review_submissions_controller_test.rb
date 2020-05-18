require 'test_helper'

class Api::V1::PeerReviewSubmissionsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup do
    @plc_reviewer = create :plc_reviewer
    sign_in(@plc_reviewer)
  end

  def common_scenario
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

  test 'Peer reviews with email filter only gets those peer reviews' do
    common_scenario

    # Create some for another submitter
    other_submitter = create :teacher
    create_peer_reviews_for_user_and_level(other_submitter, @level_3)
    submissions = PeerReview.where(level: @level_3, submitter: other_submitter)

    get :index, params: {user_q: other_submitter.email}
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

  test 'Peer reviews can be found by email for unmigrated submitters' do
    common_scenario

    # Create some for another submitter
    unmigrated_submitter = create :teacher, :demigrated
    create_peer_reviews_for_user_and_level(unmigrated_submitter, @level_3)
    submissions = PeerReview.where(level: @level_3, submitter: unmigrated_submitter)

    get :index, params: {user_q: unmigrated_submitter.email}
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

  test 'Peer reviews email filter can also fuzzy-search for name' do
    daneel = create :teacher, name: 'R. Daneel Olivaw'
    danielle = create :teacher, name: 'Danielle B'
    gerbil = create :teacher, name: 'Toothy the Gerbil'

    create_peer_reviews_for_user daneel
    create_peer_reviews_for_user danielle
    create_peer_reviews_for_user gerbil

    # Try to find "Daneel" and "Danielle" but not "Toothy"
    get :index, params: {user_q: 'Dan'}
    assert_response :success
    response = JSON.parse(@response.body)

    # R. Daneel's submissions are found
    PeerReview.where(submitter: daneel).each do |pr|
      assert response['submissions'].any? {|submission| submission['review_ids'].any? {|r| r[0] == pr.id}}
    end

    # Danielle's submissions are found
    PeerReview.where(submitter: danielle).each do |pr|
      assert response['submissions'].any? {|submission| submission['review_ids'].any? {|r| r[0] == pr.id}}
    end

    # Toothy the Gerbil's submissions are not found
    PeerReview.where(submitter: gerbil).each do |pr|
      refute response['submissions'].any? {|submission| submission['review_ids'].any? {|r| r[0] == pr.id}}
    end
  end

  test 'Peer reviews are sorted by most recent submission, descending' do
    teacher1 = create :teacher
    teacher2 = create :teacher
    teacher3 = create :teacher
    instructor = create :plc_reviewer

    Timecop.freeze(7.days.ago) do
      # Make three peer review submissions at different times.
      create_peer_reviews_for_user teacher1
      Timecop.travel 1.day
      create_peer_reviews_for_user teacher2
      Timecop.travel 1.day
      create_peer_reviews_for_user teacher3

      # Simulate an instructor review of the oldest submission, to show that
      # it doesn't affect the sort order.
      Timecop.travel 1.day
      PeerReview.where(submitter: teacher1, status: :escalated).update(
        reviewer: instructor,
        from_instructor: true,
        data: 'Great work!',
        status: :accepted
      )
    end

    # Get all submissions
    get :index
    assert_response :success
    submissions = JSON.parse(@response.body)['submissions']

    # Expect to see most recent submission first
    assert_equal(
      [teacher3.name, teacher2.name, teacher1.name],
      submissions.map {|s| s['submitter']}
    )
  end

  test 'All peer reviews gets the first page of peer reviews submissions' do
    common_scenario
    get :index
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal [
      [
        [@level_3_reviews.first.id, nil, @level_3_reviews.first.updated_at],
        [@level_3_reviews.second.id, 'escalated', @level_3_reviews.second.updated_at]
      ],
      [
        [@level_2_reviews.first.id, nil, @level_2_reviews.first.updated_at],
        [@level_2_reviews.second.id, 'accepted', @level_2_reviews.second.updated_at]
      ],
      [
        [@level_1_reviews.first.id, nil, @level_1_reviews.first.updated_at],
        [@level_1_reviews.second.id, 'escalated', @level_1_reviews.second.updated_at]
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

  test 'can retrieve a different page of peer review results' do
    test_page_size = 5

    # Create many peer reviews to test pagination
    30.times do
      create_peer_reviews_for_user create :teacher
    end

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

  test 'Peer Review report shows first submission date and latest submission date' do
    sign_out @plc_reviewer

    # Create a PD'd teacher and an instructor
    learner = create :teacher
    instructor = create :plc_reviewer

    course_unit, level = create_peer_review_module_for_learner learner

    Timecop.freeze do
      # All set up - let's jump forward in time
      Timecop.travel 1.day

      # Learner submits an answer for the level
      first_answer = create :level_source, level: level
      user_level = create :user_level,
        user: learner,
        level: level,
        level_source: first_answer,
        script: course_unit.script,
        submitted: true,
        best_result: ActivityConstants::UNREVIEWED_SUBMISSION_RESULT
      # Setup check: We created two peer reviews for this submission
      assert_equal 2, PeerReview.where(level_source: first_answer).count

      # Remember this date, we'll check it later
      first_submission_date = PeerReview.where(level_source: first_answer).last.created_at

      # The instructor reviews a day later, rejecting the submission
      Timecop.travel 1.day
      PeerReview.where(level_source: first_answer, status: :escalated).update(
        reviewer: instructor,
        from_instructor: true,
        data: 'Please make some changes',
        status: :rejected
      )

      # The learner updates their answer
      Timecop.travel 1.day
      second_answer = create :level_source, level: level
      user_level.update level_source: second_answer
      # Setup check: Two new peer reviews should exist for this submission
      assert_equal 2, PeerReview.where(level_source: second_answer).count

      # The instructor reviews again, rejecting the submission a second time
      Timecop.travel 1.day
      PeerReview.where(level_source: second_answer, status: :escalated).update(
        reviewer: instructor,
        from_instructor: true,
        data: 'Still not good enough',
        status: :rejected
      )

      # The learner updates their answer one more time
      Timecop.travel 1.day
      final_answer = create :level_source, level: level
      user_level.update level_source: final_answer
      # Setup check: Two new peer reviews should exist for this submission
      assert_equal 2, PeerReview.where(level_source: final_answer).count

      # Remember this date - we'll check it later
      last_submission_date = PeerReview.where(level_source: final_answer).last.created_at

      # The instructor reviews a third time, finally accepting the submission
      Timecop.travel 1.day
      PeerReview.where(level_source: final_answer, status: :escalated).update(
        reviewer: instructor,
        from_instructor: true,
        data: 'Great work!',
        status: :accepted
      )

      # Setup check: We should now see three completed peer reviews and one still
      # open for a non-instructor.
      assert_equal 3, PeerReview.where(level: level, submitter: learner, reviewer: instructor).count
      assert_equal 1, PeerReview.where(level: level, submitter: learner, reviewer: nil).count

      # Jump forward one more day for good measure
      Timecop.travel 1.day

      # Finally, the thing we wanted to test:
      # Generate CSV as the instructor
      sign_in instructor
      get :report_csv, params: {plc_course_unit_id: course_unit.id}
      assert_response :success
      response = CSV.parse(@response.body)

      # Check that the relevant columns are where we expect them to be
      assert_equal "#{level.name.titleize} First Submit Date", response[0][3]
      assert_equal "#{level.name.titleize} Latest Submit Date", response[0][4]

      # Check that only our test data was included (a header row and one data row)
      assert_equal 2, response.count

      # Check columns for correct dates
      assert_equal first_submission_date.strftime("%-m/%-d/%Y"), response[1][3]
      assert_equal last_submission_date.strftime("%-m/%-d/%Y"), response[1][4]
    end
  end

  test 'Peer Review report can have empty first submission date and latest submission date' do
    sign_out @plc_reviewer

    # Set up PD'd teacher
    learner = create :teacher
    course_unit, level = create_peer_review_module_for_learner learner

    # Learner saves their answer (creating a UserLevel) but does not *submit* it,
    # so no Peer Reviews are created.
    first_answer = create :level_source, level: level
    create :user_level,
      user: learner,
      level: level,
      level_source: first_answer,
      script: course_unit.script,
      submitted: false,
      best_result: ActivityConstants::UNREVIEWED_SUBMISSION_RESULT

    # Setup check: We have a UserLevel but no peer reviews for this submission
    assert_equal 0, PeerReview.where(level_source: first_answer).count

    # Finally, the thing we wanted to test:
    # Generate CSV as the instructor
    sign_in create(:plc_reviewer)
    get :report_csv, params: {plc_course_unit_id: course_unit.id}
    assert_response :success
    response = CSV.parse(@response.body)

    # Check that the relevant columns are where we expect them to be
    assert_equal "#{level.name.titleize} First Submit Date", response[0][3]
    assert_equal "#{level.name.titleize} Latest Submit Date", response[0][4]

    # Check that our test submission is still included (a header row and one data row)
    assert_equal 2, response.count

    # Check columns for correct dates
    assert_equal '', response[1][3]
    assert_equal '', response[1][4]
  end

  test 'Peer Review report returns expected columns' do
    common_scenario
    create :peer_review, reviewer: @submitter, script: @course_unit.script
    create :peer_review, reviewer: @submitter

    get :report_csv, params: {plc_course_unit_id: @course_unit.id}

    assert_response :success
    response = CSV.parse(@response.body)

    expected_headers = ['Name', 'Email']
    expected_headers << [@level_1, @level_2, @level_3].map do |level|
      [
        level.name.titleize,
        "#{level.name.titleize} First Submit Date",
        "#{level.name.titleize} Latest Submit Date"
      ]
    end
    expected_headers << 'Reviews Performed'

    date = Time.now.utc.strftime("%-m/%-d/%Y")

    assert_equal [
      expected_headers.flatten,
      [
        @submitter.name,
        @submitter.email,
        'Pending Review',
        date,
        date,
        'Accepted',
        date,
        date,
        'Pending Review',
        date,
        date,
        '1'
      ],
      [
        @teacher_reviewer.name,
        @teacher_reviewer.email,
        'Unsubmitted',
        '',
        '',
        'Unsubmitted',
        '',
        '',
        'Unsubmitted',
        '',
        '',
        '2'
      ]
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

  def create_peer_review_module_for_learner(learner)
    # Create a one-level peer review module
    course_unit = create :plc_course_unit
    level = create :free_response, peer_reviewable: true
    script_level = create :script_level, script: course_unit.script, levels: [level]
    learning_module = create :plc_learning_module, plc_course_unit: course_unit, lesson: script_level.lesson

    # Assign the learner to the peer review module
    # (Whoa let's simplify this in the future...)
    create(
      :plc_enrollment_module_assignment,
      user: learner,
      plc_learning_module: learning_module,
      plc_enrollment_unit_assignment: create(
        :plc_enrollment_unit_assignment,
        user: learner,
        plc_course_unit: course_unit,
        plc_user_course_enrollment: create(
          :plc_user_course_enrollment,
          user: learner,
          plc_course: course_unit.plc_course
        )
      )
    )

    [course_unit, level]
  end

  def create_peer_reviews_for_user_and_level(user, level, course_unit = @course_unit)
    level_source = create :level_source, level: level
    user_level = create :user_level,
      user: user,
      level: level,
      level_source: level_source,
      script: course_unit.script,
      best_result: ActivityConstants::UNREVIEWED_SUBMISSION_RESULT

    PeerReview.create_for_submission(user_level, level_source.id)
  end

  def create_peer_reviews_for_user(user)
    course_unit = create :plc_course_unit
    level = create :free_response, peer_reviewable: true
    create :script_level, script: course_unit.script, levels: [level]
    create_peer_reviews_for_user_and_level(user, level, course_unit)
  end
end
