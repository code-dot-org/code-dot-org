require 'test_helper'

class AiStudentPodcastsControllerTest < ActionController::TestCase
  setup do
    @user = create(:student)
    @other_user = create(:student)
    @lesson = create(:lesson)
    @objective1 = create(:objective)
    @objective2 = create(:objective)

    AiStudentPodcastsJob.stubs(:perform_later)
    SingleUserExperiment.stubs(:enabled?).returns(true)
  end

  teardown do
    AiStudentPodcast.destroy_all
  end

  # *****
  # Authentication
  # *****

  test 'unauthenticated user cannot call generate_podcast' do
    post :generate_podcast, params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]}, format: :json
    assert_response :unauthorized
  end

  test 'unauthenticated user cannot call show' do
    get :show, params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]}, format: :json
    assert_response :unauthorized
  end

  test 'generate_podcast returns 403 when the lesson-tutor experiment is not enabled for the user' do
    sign_in @user
    SingleUserExperiment.unstub(:enabled?)
    SingleUserExperiment.expects(:enabled?).
      with(user: @user, experiment_name: 'lesson-tutor').returns(false)

    post :generate_podcast,
      params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]},
      format: :json

    assert_response :forbidden
  end

  test 'show returns 403 when the lesson-tutor experiment is not enabled for the user' do
    sign_in @user
    SingleUserExperiment.unstub(:enabled?)
    SingleUserExperiment.expects(:enabled?).
      with(user: @user, experiment_name: 'lesson-tutor').returns(false)

    get :show, params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]}, format: :json

    assert_response :forbidden
  end

  # *****
  # generate_podcast
  # *****

  test 'generate_podcast creates a new podcast and associates objectives when none matches' do
    sign_in @user

    assert_difference 'AiStudentPodcast.count', 1 do
      assert_difference 'AiStudentPodcastObjective.count', 2 do
        post :generate_podcast,
          params: {lesson_id: @lesson.id, objective_ids: [@objective1.id, @objective2.id]},
          format: :json
      end
    end

    assert_response :ok
    created = AiStudentPodcast.last
    assert_equal @user.id, created.user_id
    assert_equal @lesson.id, created.lesson_id
    assert_equal [@objective1.id, @objective2.id].sort,
      created.ai_student_podcast_objectives.pluck(:objective_id).sort
  end

  test 'generate_podcast returns existing podcast with matching objectives' do
    sign_in @user
    existing = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id)
    existing.ai_student_podcast_objectives.create!(objective_id: @objective1.id)
    existing.ai_student_podcast_objectives.create!(objective_id: @objective2.id)

    assert_no_difference 'AiStudentPodcast.count' do
      post :generate_podcast,
        params: {lesson_id: @lesson.id, objective_ids: [@objective2.id, @objective1.id]},
        format: :json
    end

    assert_response :ok
    assert_equal existing.id, json_response['id']
  end

  test 'generate_podcast does not reuse a podcast whose objective set differs' do
    sign_in @user
    other_podcast = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id)
    other_podcast.ai_student_podcast_objectives.create!(objective_id: @objective1.id)

    assert_difference 'AiStudentPodcast.count', 1 do
      post :generate_podcast,
        params: {lesson_id: @lesson.id, objective_ids: [@objective1.id, @objective2.id]},
        format: :json
    end
    assert_response :ok
  end

  test 'generate_podcast scopes by current_user' do
    sign_in @user
    other_users_podcast = AiStudentPodcast.create!(user_id: @other_user.id, lesson_id: @lesson.id)
    other_users_podcast.ai_student_podcast_objectives.create!(objective_id: @objective1.id)

    assert_difference 'AiStudentPodcast.count', 1 do
      post :generate_podcast,
        params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]},
        format: :json
    end

    created = AiStudentPodcast.where(user_id: @user.id).last
    assert_equal @user.id, created.user_id
  end

  test 'generate_podcast enqueues AiStudentPodcastsJob with the podcast record' do
    sign_in @user
    AiStudentPodcastsJob.unstub(:perform_later)
    AiStudentPodcastsJob.expects(:perform_later).with do |args|
      args[:request][:student_podcast_data].is_a?(AiStudentPodcast)
    end

    post :generate_podcast,
      params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]},
      format: :json

    assert_response :ok
  end

  test 'generate_podcast accepts camelCase lessonId/objectiveIds parameter keys' do
    sign_in @user

    assert_difference 'AiStudentPodcast.count', 1 do
      post :generate_podcast,
        params: {lessonId: @lesson.id, objectiveIds: [@objective1.id]},
        format: :json
    end
    assert_response :ok
    created = AiStudentPodcast.last
    assert_equal @lesson.id, created.lesson_id
    assert_equal [@objective1.id], created.ai_student_podcast_objectives.pluck(:objective_id)
  end

  test 'generate_podcast reuses an existing objectiveless podcast when objective_ids is empty' do
    sign_in @user
    existing = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id)

    assert_no_difference 'AiStudentPodcast.count' do
      post :generate_podcast,
        params: {lesson_id: @lesson.id, objective_ids: []},
        format: :json
    end

    assert_response :ok
    assert_equal existing.id, json_response['id']
  end

  test 'generate_podcast creates an objectiveless podcast when objective_ids is empty and none exists' do
    sign_in @user

    assert_difference 'AiStudentPodcast.count', 1 do
      assert_no_difference 'AiStudentPodcastObjective.count' do
        post :generate_podcast,
          params: {lesson_id: @lesson.id, objective_ids: []},
          format: :json
      end
    end

    assert_response :ok
    created = AiStudentPodcast.last
    assert_equal @lesson.id, created.lesson_id
    assert_empty created.ai_student_podcast_objectives
  end

  test 'generate_podcast does not match an objective-bearing podcast when objective_ids is empty' do
    sign_in @user
    with_objectives = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id)
    with_objectives.ai_student_podcast_objectives.create!(objective_id: @objective1.id)

    assert_difference 'AiStudentPodcast.count', 1 do
      post :generate_podcast,
        params: {lesson_id: @lesson.id, objective_ids: []},
        format: :json
    end

    assert_response :ok
    refute_equal with_objectives.id, json_response['id']
  end

  # *****
  # show
  # *****

  test 'show returns the podcast matching the lesson and objective set for the current user' do
    sign_in @user
    podcast = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id, podcast_script: 'script')
    podcast.ai_student_podcast_objectives.create!(objective_id: @objective1.id)

    get :show,
      params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]},
      format: :json

    assert_response :ok
    assert_equal podcast.id, json_response['id']
    assert_equal 'script', json_response['podcast_script']
  end

  test 'show returns the objectiveless podcast when objective_ids is empty' do
    sign_in @user
    podcast = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id, podcast_script: 'lesson-level')

    get :show, params: {lesson_id: @lesson.id, objective_ids: []}, format: :json

    assert_response :ok
    assert_equal podcast.id, json_response['id']
  end

  test 'show returns 404 when no podcast matches the requested objective set' do
    sign_in @user
    podcast = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id)
    podcast.ai_student_podcast_objectives.create!(objective_id: @objective1.id)

    get :show,
      params: {lesson_id: @lesson.id, objective_ids: [@objective1.id, @objective2.id]},
      format: :json

    assert_response :not_found
  end

  test 'show returns 404 when the matching podcast belongs to another user' do
    sign_in @user
    other_podcast = AiStudentPodcast.create!(user_id: @other_user.id, lesson_id: @lesson.id)
    other_podcast.ai_student_podcast_objectives.create!(objective_id: @objective1.id)

    get :show,
      params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]},
      format: :json

    assert_response :not_found
  end

  test 'show returns 404 when no podcast exists for the lesson' do
    sign_in @user

    get :show, params: {lesson_id: 999_999, objective_ids: [@objective1.id]}, format: :json

    assert_response :not_found
  end

  # *****
  # retrieve_podcast_from_s3
  # *****

  test 'retrieve_podcast_from_s3 streams the mp3 when it exists in S3' do
    sign_in @user
    AiStudentPodcastsHelper.stubs(:exists_in_s3?).returns(true)
    AiStudentPodcastsHelper.stubs(:retrieve_podcast_from_s3).returns('mp3-bytes')

    get :retrieve_podcast_from_s3,
      params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]},
      format: :json

    assert_response :ok
    assert_equal 'mp3-bytes', @response.body
    assert_equal 'audio/mpeg', @response.media_type
  end

  test 'retrieve_podcast_from_s3 returns 404 when the podcast is not in S3' do
    sign_in @user
    AiStudentPodcastsHelper.stubs(:exists_in_s3?).returns(false)
    AiStudentPodcastsHelper.expects(:retrieve_podcast_from_s3).never

    get :retrieve_podcast_from_s3,
      params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]},
      format: :json

    assert_response :not_found
  end

  test 'retrieve_podcast_from_s3 returns 403 when the lesson-tutor experiment is not enabled' do
    sign_in @user
    SingleUserExperiment.unstub(:enabled?)
    SingleUserExperiment.expects(:enabled?).
      with(user: @user, experiment_name: 'lesson-tutor').returns(false)

    get :retrieve_podcast_from_s3,
      params: {lesson_id: @lesson.id, objective_ids: [@objective1.id]},
      format: :json

    assert_response :forbidden
  end
end
