require 'test_helper'

class ChallengesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @user = create(:student)

    @lesson = create(:lesson)
    @other_lesson = create(:lesson)

    @challenge = create(:challenge, lesson: @lesson)
    @other_challenge = create(:challenge, lesson: @lesson)
    @challenge_in_other_lesson = create(:challenge, lesson: @other_lesson)
  end

  # --- unauthenticated ---

  test 'index redirects to sign in when not signed in' do
    get :index
    assert_redirected_to_sign_in
  end

  test 'show redirects to sign in when not signed in' do
    get :show, params: {id: @challenge.id}
    assert_redirected_to_sign_in
  end

  # --- index ---

  test 'index returns all challenges when no lesson_id param given' do
    sign_in @user
    get :index
    assert_response :success
    ids = JSON.parse(response.body).map {|c| c['id']}
    assert_includes ids, @challenge.id
    assert_includes ids, @other_challenge.id
    assert_includes ids, @challenge_in_other_lesson.id
  end

  test 'index returns only challenges for the given lesson_id' do
    sign_in @user
    get :index, params: {lesson_id: @lesson.id}
    assert_response :success
    ids = JSON.parse(response.body).map {|c| c['id']}
    assert_includes ids, @challenge.id
    assert_includes ids, @other_challenge.id
    refute_includes ids, @challenge_in_other_lesson.id
  end

  test 'index returns empty array when no challenges match the given lesson_id' do
    sign_in @user
    empty_lesson = create(:lesson)
    get :index, params: {lesson_id: empty_lesson.id}
    assert_response :success
    assert_empty JSON.parse(response.body)
  end

  test 'index response includes the summarized challenge fields' do
    sign_in @user
    challenge = create(
      :challenge,
      lesson: @lesson,
      question: 'What is 2 + 2?',
      default_modality: 'whiteboard',
      whiteboard_starter_image_alt_text: 'a number grid',
    )
    get :index, params: {lesson_id: @lesson.id}
    assert_response :success
    entry = JSON.parse(response.body).find {|c| c['id'] == challenge.id}
    assert_equal @lesson.id, entry['lesson_id']
    assert_equal 'What is 2 + 2?', entry['question']
    assert_equal 'whiteboard', entry['default_modality']
    assert_equal 'a number grid', entry['whiteboard_starter_image_alt_text']
  end

  # --- show ---

  test 'show returns the challenge' do
    sign_in @user
    get :show, params: {id: @challenge.id}
    assert_response :success
    assert_equal @challenge.id, JSON.parse(response.body)['id']
  end
end
