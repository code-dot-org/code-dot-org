require 'test_helper'

class AiStudentPodcastsControllerTest < ActionController::TestCase
  setup do
    @user = create(:student)
    @other_user = create(:student)
    @lesson = create(:lesson)
    @objective1 = create(:objective)
    @objective2 = create(:objective)

    AiStudentPodcastsHelper.stubs(:create_and_save_to_s3)
    AiStudentPodcastsHelper.stubs(:generate_podcast_script).returns([{voice_id: 'Dan', text: 'hi'}].to_json)
  end

  teardown do
    AiStudentPodcast.destroy_all
  end

  # *****
  # Authentication
  # *****

  test 'unauthenticated user cannot call find_or_create_student_podcast' do
    post :find_or_create_student_podcast, params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]}, format: :json
    assert_response :unauthorized
  end

  test 'unauthenticated user cannot call show' do
    podcast = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id)
    get :show, params: {id: podcast.id}, format: :json
    assert_response :unauthorized
  end

  # *****
  # find_or_create_student_podcast
  # *****

  test 'find_or_create_student_podcast creates a new podcast and associates objectives when none matches' do
    sign_in @user

    assert_difference 'AiStudentPodcast.count', 1 do
      assert_difference 'AiStudentPodcastObjective.count', 2 do
        post :find_or_create_student_podcast,
          params: {lesson_id: @lesson.id, objective_ids: [@objective1.id, @objective2.id]},
          format: :json
      end
    end

    assert_response :created
    created = AiStudentPodcast.last
    assert_equal @user.id, created.user_id
    assert_equal @lesson.id, created.lesson_id
    assert_equal [@objective1.id, @objective2.id].sort,
      created.ai_student_podcast_objectives.pluck(:objective_id).sort
  end

  test 'find_or_create_student_podcast returns existing podcast with matching objectives' do
    sign_in @user
    existing = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id)
    existing.ai_student_podcast_objectives.create!(objective_id: @objective1.id)
    existing.ai_student_podcast_objectives.create!(objective_id: @objective2.id)

    assert_no_difference 'AiStudentPodcast.count' do
      post :find_or_create_student_podcast,
        params: {lesson_id: @lesson.id, objective_ids: [@objective2.id, @objective1.id]},
        format: :json
    end

    assert_response :ok
    assert_equal existing.id, json_response['id']
  end

  test 'find_or_create_student_podcast does not reuse a podcast whose objective set differs' do
    sign_in @user
    other_podcast = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id)
    other_podcast.ai_student_podcast_objectives.create!(objective_id: @objective1.id)

    assert_difference 'AiStudentPodcast.count', 1 do
      post :find_or_create_student_podcast,
        params: {lesson_id: @lesson.id, objective_ids: [@objective1.id, @objective2.id]},
        format: :json
    end
    assert_response :created
  end

  test 'find_or_create_student_podcast scopes by current_user' do
    sign_in @user
    other_users_podcast = AiStudentPodcast.create!(user_id: @other_user.id, lesson_id: @lesson.id)
    other_users_podcast.ai_student_podcast_objectives.create!(objective_id: @objective1.id)

    assert_difference 'AiStudentPodcast.count', 1 do
      post :find_or_create_student_podcast,
        params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]},
        format: :json
    end

    created = AiStudentPodcast.where(user_id: @user.id).last
    assert_equal @user.id, created.user_id
  end

  test 'find_or_create_student_podcast invokes create_and_save_to_s3 with the podcast' do
    sign_in @user
    AiStudentPodcastsHelper.unstub(:create_and_save_to_s3)
    AiStudentPodcastsHelper.expects(:create_and_save_to_s3).with(instance_of(AiStudentPodcast))

    post :find_or_create_student_podcast,
      params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]},
      format: :json

    assert_response :created
  end

  test 'find_or_create_student_podcast accepts camelCase lessonId/objectiveIds parameter keys' do
    sign_in @user

    assert_difference 'AiStudentPodcast.count', 1 do
      post :find_or_create_student_podcast,
        params: {lessonId: @lesson.id, objectiveIds: [@objective1.id]},
        format: :json
    end
    assert_response :created
    created = AiStudentPodcast.last
    assert_equal @lesson.id, created.lesson_id
    assert_equal [@objective1.id], created.ai_student_podcast_objectives.pluck(:objective_id)
  end

  # *****
  # show
  # *****

  test 'show returns the podcast for the current user' do
    sign_in @user
    podcast = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id, podcast_script: 'script')

    get :show, params: {id: podcast.id}, format: :json

    assert_response :ok
    assert_equal podcast.id, json_response['id']
    assert_equal 'script', json_response['podcast_script']
  end

  test 'show returns 404 when the podcast belongs to another user' do
    sign_in @user
    other_podcast = AiStudentPodcast.create!(user_id: @other_user.id, lesson_id: @lesson.id)

    get :show, params: {id: other_podcast.id}, format: :json

    assert_response :not_found
  end

  test 'show returns 404 when the podcast does not exist' do
    sign_in @user

    get :show, params: {id: 999_999}, format: :json

    assert_response :not_found
  end
end
