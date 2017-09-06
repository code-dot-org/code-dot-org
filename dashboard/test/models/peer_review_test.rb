require 'test_helper'
require 'cdo/shared_constants'

class PeerReviewTest < ActiveSupport::TestCase
  include SharedConstants

  self.use_transactional_test_case = true

  setup_all do
    @learning_module = create :plc_learning_module

    @level = FreeResponse.find_or_create_by!(
      game: Game.free_response,
      name: 'FreeResponseTest',
      level_num: 'custom',
      user_id: 0
    )
    @level.update!(
      submittable: true,
      peer_reviewable: 'true'
    )

    @script_level = create :script_level, levels: [@level], script: @learning_module.plc_course_unit.script, stage: @learning_module.stage
    @script = @script_level.script

    @user = create :user

    @level_source = create :level_source, level: @script_level.level
    Activity.create! user: @user, level: @script_level.level, test_result: Activity::UNREVIEWED_SUBMISSION_RESULT, level_source: @level_source
  end

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    Plc::EnrollmentModuleAssignment.stubs(:exists?).with(user_id: @user.id, plc_learning_module: @learning_module).returns(true)
  end

  test 'submitting a peer reviewed level should create PeerReview objects' do
    assert_difference('PeerReview.count', PeerReview::REVIEWS_PER_SUBMISSION) do
      track_progress @level_source.id
    end
  end

  test 'submitting a peer reviewed level when I am not enrolled in the module should not create PeerReview objects' do
    Plc::EnrollmentModuleAssignment.stubs(:exists?).returns(false)

    assert_no_difference('PeerReview.count', PeerReview::REVIEWS_PER_SUBMISSION) do
      track_progress @level_source.id
    end
  end

  test 'submitting a non peer reviewable level should not create Peer Review objects' do
    @level.peer_reviewable = 'false'
    @level.save

    assert_no_difference('PeerReview.count', PeerReview::REVIEWS_PER_SUBMISSION) do
      track_progress @level_source.id
    end
  end

  test 'resubmitting for review should remove unassigned PeerReview objects' do
    initial = PeerReview.count
    track_progress @level_source.id
    assert_equal PeerReview::REVIEWS_PER_SUBMISSION, PeerReview.count - initial

    # Assign one review
    PeerReview.last.update! reviewer: create(:user)

    updated_level_source = create :level_source, data: 'UPDATED: My submitted answer'

    initial = PeerReview.count
    track_progress updated_level_source.id
    assert_equal PeerReview::REVIEWS_PER_SUBMISSION - 1, PeerReview.count - initial
  end

  test 'instructor review should mark as accepted and delete outstanding unfilled reviews' do
    track_progress @level_source.id
    review1 = PeerReview.offset(1).last
    review2 = PeerReview.last

    user_level = UserLevel.find_by(user: review1.submitter, level: review1.level, script: review1.script)
    assert_equal Activity::UNREVIEWED_SUBMISSION_RESULT, user_level.best_result

    review1.update! reviewer: create(:user), status: 'accepted', from_instructor: true
    refute PeerReview.where(id: review2.id).any?

    user_level.reload
    assert_equal Activity::REVIEW_ACCEPTED_RESULT, user_level.best_result
  end

  test 'approving both reviews should mark the corresponding UserLevel as accepted' do
    track_progress @level_source.id
    review1 = PeerReview.offset(1).last
    review2 = PeerReview.last

    user_level = UserLevel.find_by(user: review1.submitter, level: review1.level, script: review1.script)
    assert_equal Activity::UNREVIEWED_SUBMISSION_RESULT, user_level.best_result

    review1.update! reviewer: create(:user), status: 'accepted'
    user_level.reload
    assert_equal Activity::UNREVIEWED_SUBMISSION_RESULT, user_level.best_result

    review2.update! reviewer: create(:user), status: 'accepted'
    user_level.reload
    assert_equal Activity::REVIEW_ACCEPTED_RESULT, user_level.best_result
  end

  test 'rejecting both reviews should mark the corresponding UserLevel as rejected' do
    track_progress @level_source.id
    review1 = PeerReview.offset(1).last
    review2 = PeerReview.last

    user_level = UserLevel.find_by(user: review1.submitter, level: review1.level, script: review1.script)
    assert_equal Activity::UNREVIEWED_SUBMISSION_RESULT, user_level.best_result

    review1.update! reviewer: create(:user), status: 'rejected'
    user_level.reload
    assert_equal Activity::UNREVIEWED_SUBMISSION_RESULT, user_level.best_result

    review2.update! reviewer: create(:user), status: 'rejected'
    user_level.reload
    assert_equal Activity::REVIEW_REJECTED_RESULT, user_level.best_result
  end

  test 'pull review from pool' do
    reviewer_1 = create :teacher
    reviewer_2 = create :teacher

    level_source = create(:level_source, data: 'Some answer')

    Activity.create!(user: @user, level: @script_level.level, test_result: Activity::UNREVIEWED_SUBMISSION_RESULT, level_source: level_source)
    track_progress(level_source.id)

    assert_equal [nil, nil], PeerReview.all.map(&:reviewer)

    [reviewer_1, reviewer_2].each do |user|
      assert_equal user, PeerReview.pull_review_from_pool(@script_level.script, user).reviewer

      3.times do
        assert_nil PeerReview.pull_review_from_pool(@script_level.script, user)
      end
    end

    3.times do
      assert_nil PeerReview.pull_review_from_pool(@script_level.script, @user)
    end

    assert_equal Set.new([reviewer_1, reviewer_2]), Set.new(PeerReview.all.map(&:reviewer))
  end

  test 'pull review from pool handles stale reviews' do
    reviewer_1, reviewer_2, reviewer_3 = [].tap do |teachers|
      3.times {teachers << create(:teacher)}
    end

    level_source = create(:level_source, data: 'Some answer')

    Activity.create!(user: @user, level: @script_level.level, test_result: Activity::UNREVIEWED_SUBMISSION_RESULT, level_source: level_source)
    track_progress(level_source.id)

    first_review = PeerReview.pull_review_from_pool(@script_level.script, reviewer_1)
    PeerReview.pull_review_from_pool(@script_level.script, reviewer_2)

    # Let's say reviewer 1 doesn't finish their review - AKA the created date was more than a day ago
    first_review.update(created_at: 2.days.ago)

    # Now when reviewer 3 pulls a review, they should get the first review but updated with them as the reviewer now
    new_review = PeerReview.pull_review_from_pool(@script_level.script, reviewer_3)
    assert_equal first_review.id, new_review.id
    assert_equal reviewer_3, new_review.reviewer
    assert_equal Set.new([reviewer_2, reviewer_3]), Set.new(PeerReview.all.map(&:reviewer))
  end

  test 'pull review from the pool clones reviews if necessary' do
    @script.update(peer_reviews_to_complete: 2)
    Plc::EnrollmentUnitAssignment.stubs(:exists?).returns(true)
    reviewer_1, reviewer_2, reviewer_3 = [].tap do |teachers|
      3.times {teachers << create(:teacher)}
    end

    level_source = create(:level_source, data: 'Some answer')

    Activity.create!(user: @user, level: @script_level.level, test_result: Activity::UNREVIEWED_SUBMISSION_RESULT, level_source: level_source)
    track_progress(level_source.id)

    first_review = PeerReview.pull_review_from_pool(@script_level.script, reviewer_1)
    second_review = PeerReview.pull_review_from_pool(@script_level.script, reviewer_2)

    # Complete both reviews
    [first_review, second_review].each do |review|
      review.update(status: 0, data: 'lgtm')
    end

    # When the third reviewer goes to the page, they should get a link
    review_summary = PeerReview.get_peer_review_summaries(reviewer_3, @script_level.script)
    expected_review = {
      status: LEVEL_STATUS.not_tried,
      name: I18n.t('peer_review.review_new_submission'),
      result: ActivityConstants::UNSUBMITTED_RESULT,
      icon: '',
      locked: false
    }

    assert_equal expected_review, review_summary.first

    # When the third reviewer tries to pull, there are no reviews for them to do. So they should get a clone
    third_review = PeerReview.pull_review_from_pool(@script_level.script, reviewer_3)
    assert_equal 3, PeerReview.count
    assert_nil third_review.data
    assert_nil third_review.status
    assert_equal reviewer_3.id, third_review.reviewer_id
  end

  test 'pull review from the pool returns nothing if there are no reviews' do
    reviewer_1 = create :teacher
    assert_nil PeerReview.pull_review_from_pool(@script_level.script, reviewer_1)
  end

  test 'Merging peer review progress does not merge progress with no user, script nor enrollment' do
    assert_nil PeerReview.get_peer_review_summaries(nil, @script)

    assert_nil PeerReview.get_peer_review_summaries(@user, @script)

    @script.update(professional_learning_course: true)
    assert_nil PeerReview.get_peer_review_summaries(@user, @script)
  end

  test 'Merging peer review progress merges progress for enrolled users' do
    @script.update(professional_learning_course: true, peer_reviews_to_complete: 3)
    Plc::UserCourseEnrollment.create(user: @user, plc_course: @script.plc_course_unit.plc_course)

    assert PeerReview.get_peer_review_summaries(@user, @script).empty?

    submitter_1 = create :teacher
    submitter_2 = create :teacher
    submitter_3 = create :teacher

    [submitter_1, submitter_2, submitter_3].each do |submitter|
      Plc::EnrollmentModuleAssignment.stubs(:exists?).with(user_id: submitter.id, plc_learning_module: @learning_module).returns(true)
    end

    level_source_1 = create(:level_source, data: 'Some answer')
    level_source_2 = create(:level_source, data: 'Other answer')
    level_source_3 = create(:level_source, data: 'Unreviewed answer')

    [[submitter_1, level_source_1], [submitter_2, level_source_2], [submitter_3, level_source_3]].each do |submitter, level_source|
      Activity.create!(user: submitter, level: @script_level.level, test_result: Activity::UNSUBMITTED_RESULT, level_source: level_source)
      track_progress(level_source.id, submitter)
    end

    first_review = PeerReview.pull_review_from_pool(@script, @user)
    first_review.update!(status: 'accepted')
    second_review = PeerReview.pull_review_from_pool(@script, @user)

    # Expect three things, one complete peer review, one incomplete peer review, and one link to new reviews
    expected_reviews = [
      {
        id: first_review.id,
        status: LEVEL_STATUS.perfect,
        name: I18n.t('peer_review.link_to_submitted_review'),
        result: ActivityConstants::BEST_PASS_RESULT,
        locked: false
      },
      {
        id: second_review.id,
        status: LEVEL_STATUS.not_tried,
        name: I18n.t('peer_review.review_in_progress'),
        result: ActivityConstants::UNSUBMITTED_RESULT,
        locked: false
      },
      {
        status: LEVEL_STATUS.not_tried,
        name: 'Review a new submission',
        result: ActivityConstants::UNSUBMITTED_RESULT,
        icon: '',
        locked: false
      }
    ]

    assert_equal expected_reviews, PeerReview.get_peer_review_summaries(@user, @script)
  end

  test 'peer review section status' do
    @script.update(peer_reviews_to_complete: 2)
    Plc::EnrollmentUnitAssignment.stubs(:exists?).returns(true)

    PeerReview.stubs(:where).returns([0, 0]) # Just need to return an array of size two
    assert_equal Plc::EnrollmentModuleAssignment::COMPLETED, PeerReview.get_review_completion_status(@user, @script)

    PeerReview.stubs(:where).returns([0])
    assert_equal Plc::EnrollmentModuleAssignment::IN_PROGRESS, PeerReview.get_review_completion_status(@user, @script)

    PeerReview.stubs(:where).returns([])
    assert_equal Plc::EnrollmentModuleAssignment::NOT_STARTED, PeerReview.get_review_completion_status(@user, @script)
  end

  test 'peer review section status edge cases' do
    assert_nil PeerReview.get_review_completion_status(nil, @script)

    @script.update(peer_reviews_to_complete: nil)
    assert_nil PeerReview.get_review_completion_status(@user, @script)

    @script.update(peer_reviews_to_complete: 0)
    assert_nil PeerReview.get_review_completion_status(@user, @script)

    @script.update(peer_reviews_to_complete: 2)
    assert_nil PeerReview.get_review_completion_status(@user, @script)
  end

  test 'clear_data clears the data column' do
    peer_review = create :peer_review, data: 'data'
    peer_review.clear_data
    assert_equal PeerReview::SYSTEM_DELETED_DATA, peer_review.data
  end

  test 'assignments are logged to the audit trail' do
    peer_review = create :peer_review
    user1 = create :user
    user2 = create :user

    peer_review.update! reviewer: user1
    assert_equal 1, peer_review.audit_trail.lines.count
    assert peer_review.audit_trail.lines.last.include? "ASSIGNED to user id #{user1.id}"

    peer_review.reviewer = user2
    peer_review.update! reviewer: user2
    assert_equal 2, peer_review.audit_trail.lines.count
    assert peer_review.audit_trail.lines.last.include? "ASSIGNED to user id #{user2.id}"

    peer_review.update! reviewer: nil
    assert_equal 3, peer_review.audit_trail.lines.count
    assert peer_review.audit_trail.lines.last.include? "UNASSIGNED"
  end

  test 'reviews are logged to the audit trail' do
    user = create(:user)
    peer_review = create :peer_review, reviewer: user
    peer_review.update! status: 'accepted'

    assert peer_review.audit_trail.lines.last.include? "REVIEWED by user id #{user.id} as accepted"
  end

  test 'accepted reviews are logged to the audit trail' do
    track_progress @level_source.id
    reviews = PeerReview.last(2)
    users = create_list :user, 2

    reviews.each_with_index do |review, i|
      review.update!(reviewer: users[i], status: 'accepted')
    end

    # 1 line for the assignment, 1 for the review, 1 for the completion
    assert_equal 3, reviews.last.audit_trail.lines.count
    assert reviews.last.audit_trail.lines.last.include? "ACCEPTED by user id #{users.last.id}"
  end

  test 'rejected reviews are logged to the audit trail' do
    track_progress @level_source.id
    reviews = PeerReview.last(2)
    users = create_list :user, 2

    reviews.each_with_index do |review, i|
      review.update!(reviewer: users[i], status: 'rejected')
    end

    # 1 line for the assignment, 1 for the review, 1 for the rejection
    assert_equal 3, reviews.last.audit_trail.lines.count
    assert reviews.last.audit_trail.lines.last.include? "REJECTED by user id #{users.last.id}"
  end

  test 'no consensus reviews log to the audit trail and escalate' do
    track_progress @level_source.id
    reviews = PeerReview.last(2)
    users = create_list :user, 2

    assert_does_not_create PeerReview do
      reviews[0].update!(reviewer: users[0], status: 'accepted')
    end
    assert_creates PeerReview do
      reviews[1].update!(reviewer: users[1], status: 'rejected')
    end
    escalated_review = PeerReview.last
    assert_nil escalated_review.reviewer
    assert_equal 'escalated', escalated_review.status
    assert_equal @user, escalated_review.submitter
    refute escalated_review.from_instructor
    assert_equal @script, escalated_review.script
    assert_equal @level, escalated_review.level
    assert_equal @level_source, escalated_review.level_source
    assert_nil escalated_review.data

    # 1 line for the assignment, 1 for the review, 1 for the no consensus
    assert_equal 3, reviews.last.audit_trail.lines.count
    assert reviews.last.audit_trail.lines.last.include? "NO CONSENSUS after review by user id #{users.last.id}"
  end

  test 'instructor reviews log to the audit trail' do
    instructor = create :teacher
    track_progress @level_source.id
    review = PeerReview.last

    review.update!(reviewer: instructor, status: 'accepted', from_instructor: true)
    assert review.audit_trail.lines.last.include? "ACCEPTED by instructor #{instructor.id} #{instructor.name}"

    review.update!(reviewer: instructor, status: 'rejected', from_instructor: true)
    assert review.audit_trail.lines.last.include? "REJECTED by instructor #{instructor.id} #{instructor.name}"
  end

  private

  def track_progress(level_source_id, user = @user)
    # this is what creates the peer review objects
    User.track_level_progress_sync(
      user_id: user.id,
      level_id: @script_level.level_id,
      script_id: @script_level.script_id,
      new_result: Activity::UNREVIEWED_SUBMISSION_RESULT,
      submitted: true,
      level_source_id: level_source_id,
      pairing_user_ids: nil
    )
  end
end
