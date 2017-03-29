require 'test_helper'
require 'cdo/shared_constants'

class PeerReviewTest < ActiveSupport::TestCase
  include SharedConstants

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    @learning_module = create :plc_learning_module

    @level = FreeResponse.find_or_create_by!(
      game: Game.free_response,
      name: 'FreeResponseTest',
      level_num: 'custom',
      user_id: 0
    )
    @level.submittable = true
    @level.peer_reviewable = 'true'
    @level.save!

    @script_level = create :script_level, levels: [@level], script: @learning_module.plc_course_unit.script, stage: @learning_module.stage
    @script = @script_level.script

    @user = create :user

    Plc::EnrollmentModuleAssignment.stubs(:exists?).with(user_id: @user.id, plc_learning_module: @learning_module).returns(true)
  end

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

  test 'submitting a peer reviewed level should create PeerReview objects' do
    level_source = create :level_source, data: 'My submitted answer'

    assert_difference('PeerReview.count', PeerReview::REVIEWS_PER_SUBMISSION) do
      track_progress level_source.id
    end
  end

  test 'submitting a peer reviewed level when I am not enrolled in the module should not create PeerReview objects' do
    level_source = create :level_source, data: 'My submitted answer'
    Plc::EnrollmentModuleAssignment.stubs(:exists?).returns(false)

    assert_no_difference('PeerReview.count', PeerReview::REVIEWS_PER_SUBMISSION) do
      track_progress level_source.id
    end
  end

  test 'submitting a non peer reviewable level should not create Peer Review objects' do
    @level.peer_reviewable = 'false'
    @level.save

    level_source = create :level_source, data: 'My submitted answer'

    assert_no_difference('PeerReview.count', PeerReview::REVIEWS_PER_SUBMISSION) do
      track_progress level_source.id
    end
  end

  test 'resubmitting for review should remove unassigned PeerReview objects' do
    level_source = create :level_source, data: 'My submitted answer'

    initial = PeerReview.count
    track_progress level_source.id
    assert_equal PeerReview::REVIEWS_PER_SUBMISSION, PeerReview.count - initial

    # Assign one review
    PeerReview.last.update! reviewer: create(:user)

    updated_level_source = create :level_source, data: 'UPDATED: My submitted answer'

    initial = PeerReview.count
    track_progress updated_level_source.id
    assert_equal PeerReview::REVIEWS_PER_SUBMISSION - 1, PeerReview.count - initial
  end

  test 'instructor review should mark as accepted and delete outstanding unfilled reviews' do
    level_source = create :level_source, data: 'My submitted answer'

    Activity.create! user: @user, level: @script_level.level, test_result: Activity::UNREVIEWED_SUBMISSION_RESULT, level_source: level_source
    track_progress level_source.id
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
    level_source = create :level_source, data: 'My submitted answer'

    Activity.create! user: @user, level: @script_level.level, test_result: Activity::UNREVIEWED_SUBMISSION_RESULT, level_source: level_source
    track_progress level_source.id
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
    level_source = create :level_source, data: 'My submitted answer'

    Activity.create! user: @user, level: @script_level.level, test_result: Activity::UNREVIEWED_SUBMISSION_RESULT, level_source: level_source
    track_progress level_source.id
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
end
