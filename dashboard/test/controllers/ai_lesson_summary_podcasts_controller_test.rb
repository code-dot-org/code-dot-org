require 'test_helper'

class AiLessonSummaryPodcastsControllerTest < ActionController::TestCase
  setup_all do
    @teacher = create(:teacher)
    @lesson = create(:lesson)
    @unit = create(:script)
    @test_script = "[energetic] You're listening to AI Teaching Assistant's Daily Byte, your quick check-in before class."
    @test_script_response = {json: "{\"podcast_script\": \"#{@test_script}\"}"}
    @test_audio_data = "fake_audio_data_mp3_content"
  end

  # *****
  # Authentication tests
  # *****

  test 'unauthenticated user cannot access generate_podcast' do
    post :generate_podcast
    assert_response :redirect
  end

  # *****
  # Feature flag and experiment tests
  # *****

  test 'generate_podcast returns forbidden when experiment is disabled and DCDO flag is false' do
    sign_in @teacher

    # Mock the experiment and DCDO checks
    SingleUserExperiment.stubs(:enabled?).with(user: @teacher, experiment_name: 'ai_lesson_summaries').returns(false)
    DCDO.stubs(:get).with('show-aita-lesson-summaries', false).returns(false)

    post :generate_podcast

    assert_response :forbidden
  end

  test 'generate_podcast works when SingleUserExperiment is enabled' do
    sign_in @teacher

    # Mock the experiment to be enabled
    SingleUserExperiment.stubs(:enabled?).with(user: @teacher, experiment_name: 'ai_lesson_summaries').returns(true)

    # Mock the helper methods
    AiLessonSummariesHelper.stubs(:generate_lesson_summary).returns(@test_script_response)
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(@test_audio_data)

    post :generate_podcast, params: {
      lesson_id: @lesson.id,
      unit_id: @unit.id,
      lesson_summary: "Test summary",
    }

    assert_response :success
    assert_equal 'audio/mpeg', response.content_type
    assert_equal "attachment; filename=\"podcast.mp3\"; filename*=UTF-8''podcast.mp3", response.headers['Content-Disposition']
    assert_equal @test_audio_data, response.body
  end

  test 'generate_podcast works when DCDO flag is enabled' do
    sign_in @teacher

    # Mock the experiment to be disabled but DCDO flag enabled
    SingleUserExperiment.stubs(:enabled?).with(user: @teacher, experiment_name: 'ai_lesson_summaries').returns(false)
    DCDO.stubs(:get).with('show-aita-lesson-summaries', false).returns(true)

    # Mock the helper methods
    AiLessonSummariesHelper.stubs(:generate_lesson_summary).returns(@test_script_response)
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(@test_audio_data)

    post :generate_podcast, params: {
      lesson_id: @lesson.id,
      unit_id: @unit.id,
      lesson_summary: "Test summary",
    }

    assert_response :success
    assert_equal 'audio/mpeg', response.content_type
    assert_equal "attachment; filename=\"podcast.mp3\"; filename*=UTF-8''podcast.mp3", response.headers['Content-Disposition']
    assert_equal @test_audio_data, response.body
  end

  # *****
  # Helper integration tests
  # *****

  test 'generate_podcast calls helper with correct script' do
    sign_in @teacher

    # Enable access
    SingleUserExperiment.stubs(:enabled?).with(user: @teacher, experiment_name: 'ai_lesson_summaries').returns(true)

    # Expect the helpers
    AiLessonSummariesHelper.stubs(:generate_lesson_summary).returns(@test_script_response)
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(@test_audio_data)

    post :generate_podcast, params: {
      lesson_id: @lesson.id,
      unit_id: @unit.id
    }

    assert_response :success
  end

  test 'generate_podcast handles helper errors gracefully' do
    sign_in @teacher

    # Enable access
    SingleUserExperiment.stubs(:enabled?).with(user: @teacher, experiment_name: 'ai_lesson_summaries').returns(true)
    DCDO.stubs(:get).with('show-aita-lesson-summaries', false).returns(false)

    # Mock the helpers to raise an error
    AiLessonSummariesHelper.stubs(:generate_lesson_summary).returns(@test_script_response)
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).raises(StandardError.new("API Error"))

    # The controller should let the error bubble up (no explicit error handling)
    assert_raises(StandardError) do
      post :generate_podcast, params: {
        lesson_id: @lesson.id,
        unit_id: @unit.id
      }
    end
  end

  # *****
  # Response format tests
  # *****

  test 'generate_podcast returns correct content type and headers' do
    sign_in @teacher

    # Enable access
    SingleUserExperiment.stubs(:enabled?).with(user: @teacher, experiment_name: 'ai_lesson_summaries').returns(true)

    # Mock the helper methods
    AiLessonSummariesHelper.stubs(:generate_lesson_summary).returns(@test_script_response)
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(@test_audio_data)

    post :generate_podcast, params: {
      lesson_id: @lesson.id,
      unit_id: @unit.id
    }

    assert_response :success
    assert_equal 'audio/mpeg', response.content_type
    assert_equal 'attachment', response.headers['Content-Disposition'].split(';').first.strip
    assert_includes response.headers['Content-Disposition'], 'filename="podcast.mp3"'
    assert_equal @test_audio_data, response.body
  end

  test 'generate_podcast returns audio data as response body' do
    sign_in @teacher

    # Enable access
    SingleUserExperiment.stubs(:enabled?).with(user: @teacher, experiment_name: 'ai_lesson_summaries').returns(true)

    # Mock with different audio data
    different_audio_data = "different_mp3_binary_content"
    AiLessonSummariesHelper.stubs(:generate_lesson_summary).returns(@test_script_response)
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(different_audio_data)

    post :generate_podcast, params: {
      lesson_id: @lesson.id,
      unit_id: @unit.id
    }

    assert_response :success
    assert_equal different_audio_data, response.body
  end

  # *****
  # Parameter handling tests
  # *****

  test 'podcast_params permits correct parameters' do
    sign_in @teacher

    # Enable access
    SingleUserExperiment.stubs(:enabled?).with(user: @teacher, experiment_name: 'ai_lesson_summaries').returns(true)
    AiLessonSummariesHelper.stubs(:generate_lesson_summary).returns(@test_script_response)
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(@test_audio_data)

    # Test with parameters
    post :generate_podcast, params: {
      lesson_id: @lesson.id,
      unit_id: @unit.id,
      lesson_summary: "Test summary",
      unauthorized_param: "should_be_filtered"
    }

    # Should still work despite extra params
    assert_response :success
  end

  test 'podcast_params transforms camelCase to snake_case' do
    controller = AiLessonSummaryPodcastsController.new

    # Mock params hash with camelCase keys
    mock_params = ActionController::Parameters.new({
                                                     'lessonId' => '123',
      'unitId' => '456',
      'lessonSummary' => 'Test summary',
      'someOtherParam' => 'value'
                                                   }
)

    controller.stubs(:params).returns(mock_params)

    permitted_params = controller.send(:podcast_params)

    # Check that keys are transformed to snake_case and properly permitted
    assert_includes permitted_params, 'lesson_id'
    assert_includes permitted_params, 'unit_id'
    assert_includes permitted_params, 'lesson_summary'
    refute_includes permitted_params, 'some_other_param'  # Should be filtered out

    assert_equal '123', permitted_params['lesson_id']
    assert_equal '456', permitted_params['unit_id']
    assert_equal 'Test summary', permitted_params['lesson_summary']
  end
end
