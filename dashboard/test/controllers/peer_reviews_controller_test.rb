require 'test_helper'
require 'cdo/shared_constants'

class PeerReviewsControllerTest < ActionController::TestCase
  include SharedConstants

  self.use_transactional_test_case = true

  setup_all do
    @user = create :teacher
    @other_user = create :teacher

    level = create :free_response
    level.update(submittable: true, peer_reviewable: true)

    @learning_module = create :plc_learning_module
    @learning_module.plc_course_unit.script.update(peer_reviews_to_complete: 1)

    @script_level = create :script_level, levels: [level], stage: @learning_module.stage
    @script = @script_level.script

    @level_source = create :level_source, data: 'My submitted answer'
  end

  setup do
    sign_in(@user)
    Plc::EnrollmentModuleAssignment.stubs(:exists?).returns(true)
    User.track_level_progress_sync(user_id: @other_user.id, level_id: @script_level.level_id, script_id: @script_level.script_id, new_result: Activity::UNSUBMITTED_RESULT, submitted: true, level_source_id: @level_source.id)
    @peer_review = PeerReview.first
    @peer_review.user_level.update_column(:best_result, ActivityConstants::UNREVIEWED_SUBMISSION_RESULT)
  end

  test 'non admins cannot access index' do
    get :index
    assert :forbidden

    sign_out(@user)
    sign_in(create(:admin))

    get :index
    assert :success
  end

  test 'Users can access and update their own peer reviews' do
    @peer_review.update(reviewer: @user)

    get :show, params: {id: @peer_review.id}
    assert :success
    assert_select '#previous-reviews', 0
  end

  test 'Reviewers can access peer escalated reviews and view other submissions' do
    reviewer = create :plc_reviewer

    @peer_review.update(reviewer: @user, data: 'Looks good to the user')
    PeerReview.second.update(reviewer: reviewer, status: 'accepted', data: 'Looks good to the reviewer')
    sign_out(@user)
    sign_in(reviewer)

    get :show, params: {id: PeerReview.last.id}
    assert :success
    assert_select '.peer-review-content', 1
    assert_equal ['Looks good to the user'], css_select('.peer-review-data').map(&:text)
  end

  test 'Users cannot access other peer reviews' do
    sign_out(@user)
    sign_in(@other_user)

    get :show, params: {id: @peer_review.id}
    assert :forbidden
  end

  test 'Pull review pulls a peer review' do
    @script.update(professional_learning_course: true)
    Plc::UserCourseEnrollment.create(user: @user, plc_course: @script.plc_course_unit.plc_course)

    assert_equal 0, PeerReview.where(reviewer: @user).size
    get :pull_review, params: {script_id: @script.name}
    @peer_review.reload
    assert_equal @user.id, @peer_review.reviewer_id
    assert_redirected_to peer_review_path(@peer_review)
  end

  test 'Pull review redirects if there are no reviews to assign' do
    PeerReview.update_all(reviewer_id: @user.id)

    get :pull_review, params: {script_id: @script.name}
    assert_redirected_to script_path(@script)
  end

  test 'Submitting a review redirects to the index if user is a plc reviewer' do
    plc_reviewer = create :teacher
    plc_reviewer.permission = 'plc_reviewer'

    sign_out(@user)
    sign_in(plc_reviewer)

    @peer_review.update(reviewer_id: plc_reviewer.id)
    post :update, params: {
      id: @peer_review.id,
      peer_review: {status: 'accepted', data: 'This is great'}
    }
    @peer_review.reload
    assert @peer_review.from_instructor
    assert_redirected_to peer_reviews_dashboard_path
  end

  test 'Submitting a review that throws an exception logs an error to Honeybadger' do
    @peer_review.update(reviewer_id: @user.id)
    PeerReview.any_instance.stubs(:update!).raises(ActiveRecord::RecordNotSaved)
    Honeybadger.expects(:notify)

    post :update, params: {
      id: @peer_review.id,
      peer_review: {status: 'accepted', data: 'This is great'}
    }

    assert_redirected_to peer_review_path(@peer_review)
  end

  test 'Submitting a review redirects to the script view' do
    @peer_review.update(reviewer_id: @user.id)
    post :update, params: {
      id: @peer_review.id,
      peer_review: {status: 'accepted', data: 'This is great'}
    }
    assert_redirected_to script_path(@script)
  end

  test 'Submitting a peer review with emojis strips out the emojis' do
    @peer_review.update(reviewer_id: @user.id)
    post :update, params: {
      id: @peer_review.id,
      peer_review: {data: panda_panda}
    }
    @peer_review.reload
    assert_equal 'Panda', @peer_review.data
  end

  test 'Dashboard dropdown gets only plc courses that have peer reviews' do
    create :plc_course, name: 'Non peer reviewable course'
    sign_in(create(:plc_reviewer))

    get :dashboard
    assert_response :success
    plc_course = @learning_module.plc_course_unit.plc_course
    assert_equal [[plc_course.name, plc_course.id]], assigns(:course_list)
  end

  [:plc_reviewer, :facilitator, :teacher, :student].each do |user|
    test_user_gets_response_for(
      :dashboard,
      user: user,
      response: user == :plc_reviewer ? :success : :forbidden
    )
  end
end
