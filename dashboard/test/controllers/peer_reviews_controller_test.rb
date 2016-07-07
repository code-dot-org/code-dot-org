require 'test_helper'

class PeerReviewsControllerTest < ActionController::TestCase
  setup do
    @user = create :teacher
    @other_user = create :teacher
    sign_in(@user)

    level = FreeResponse.find_or_create_by!(
      game: Game.free_response,
      name: 'FreeResponseTest',
      level_num: 'custom',
      user_id: 0
    )
    level.submittable = true
    level.peer_reviewable = true
    level.save!

    @script_level = create :script_level, levels: [level]
    @script = @script_level.script
    level_source = create :level_source, data: 'My submitted answer'
    User.track_level_progress_sync(user_id: @other_user.id, level_id: @script_level.level_id, script_id: @script_level.script_id, new_result: Activity::UNSUBMITTED_RESULT, submitted: true, level_source_id: level_source.id)
    @peer_review = PeerReview.first
    PeerReview.where.not(id: @peer_review.id).destroy_all
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

    get :show, id: @peer_review.id
    assert :success
  end

  test 'Users cannot access other peer reviews' do
    sign_out(@user)
    sign_in(@other_user)

    get :show, id: @peer_review.id
    assert :forbidden
  end

  test 'Pull review pulls a peer review' do
    @script.update(professional_learning_course: true)
    Plc::UserCourseEnrollment.create(user: @user, plc_course: @script.plc_course_unit.plc_course)

    assert_equal 0, PeerReview.where(reviewer: @user).size
    get :pull_review, script_id: @script.name
    @peer_review.reload
    assert_equal @user.id, @peer_review.reviewer_id
    assert_redirected_to peer_review_path(@peer_review)
  end

  test 'Pull review redirects if there are no reviews to assign' do
    PeerReview.update_all(reviewer_id: @user.id)

    get :pull_review, script_id: @script.name
    assert_redirected_to script_path(@script)
  end

  test 'Submitting a review redirects to the script view' do
    post :update, id: @peer_review.id, peer_review: {status: 'accepted', data: 'This is great'}
    assert_redirected_to script_path(@script)
  end
end
