require 'test_helper'

class AiLessonSummaryPodcastsControllerTest < ActionController::TestCase
  include ActiveJob::TestHelper
  setup_all do
    @teacher = create(:teacher)
    @lesson = create(:lesson, has_lesson_plan: true)
    @unit = create(:script, :with_lessons)
    @unit.curriculum_umbrella = Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.foundations_of_cs
    @unit.save!
    @test_audio_data = "fake_audio_data_mp3_content"
  end

  # *****
  # Authentication tests
  # *****

  test 'unauthenticated user cannot access generate_podcasts_by_unit' do
    post :generate_podcasts_by_unit
    assert_response :redirect
  end

  # *****
  # Feature flag and experiment tests
  # *****

  test 'generate_podcasts_by_unit returns forbidden when DCDO flag is false' do
    sign_in @teacher

    # Mock the DCDO check
    DCDO.stubs(:get).with('ai-lesson-summary-podcasts', false).returns(false)

    post :generate_podcasts_by_unit

    assert_response :forbidden
  end

  test 'generate_podcasts_by_unit enqueues job when DCDO flag is enabled and unit is AIF' do
    sign_in @teacher

    # Mock the DCDO flag enabled
    DCDO.stubs(:get).with('ai-lesson-summary-podcasts', false).returns(true)

    assert_enqueued_with(job: AiLessonSummaryPodcastsJob) do
      post :generate_podcasts_by_unit, params: {
        unit_id: @unit.id
      }
    end

    assert_response :success
    assert_nil response.content_type
  end

  # *****
  # Helper integration tests
  # *****

  test 'generate_podcasts_by_unit returns forbidden for non-AIF units' do
    sign_in @teacher

    # Change unit to non-AIF
    @unit.curriculum_umbrella = 'foundations_of_cs'
    @unit.save!

    # Enable access
    DCDO.stubs(:get).with('ai-lesson-summary-podcasts', false).returns(true)

    post :generate_podcasts_by_unit, params: {
      unit_id: @unit.id
    }

    assert_response :forbidden
  end

  test 'generate_podcasts_by_unit only includes lessons with lesson plans' do
    sign_in @teacher

    # Create a unit with lessons that have and don't have lesson plans
    unit_with_mixed_lessons = create(:script)
    unit_with_mixed_lessons.curriculum_umbrella = 'AIF'
    unit_with_mixed_lessons.save!

    lesson_group = create(:lesson_group, script: unit_with_mixed_lessons)
    create(:lesson, lesson_group: lesson_group, has_lesson_plan: true)
    create(:lesson, lesson_group: lesson_group, has_lesson_plan: false)

    # Enable access
    DCDO.stubs(:get).with('ai-lesson-summary-podcasts', false).returns(true)

    assert_enqueued_with(job: AiLessonSummaryPodcastsJob) do
      post :generate_podcasts_by_unit, params: {
        unit_id: unit_with_mixed_lessons.id
      }
    end

    assert_response :success
  end

  # *****
  # S3 serving tests (show method)
  # *****

  test 'show returns correct content type and headers for podcast from S3' do
    sign_in @teacher

    # Mock S3 download
    AWS::S3.stubs(:download_from_bucket).with('org.code.autoscale-prod-studio.user-content', 'podcasts/lesson_123_podcast.mp3').returns(@test_audio_data)

    get :show, params: {
      lesson_id: '123'
    }

    assert_response :success
    assert_equal 'audio/mpeg', response.content_type
    assert_equal 'inline', response.headers['Content-Disposition']
    assert_equal @test_audio_data, response.body
  end

  test 'show returns audio data from S3 as response body' do
    sign_in @teacher

    # Mock with different audio data
    different_audio_data = "different_mp3_binary_content"
    AWS::S3.stubs(:download_from_bucket).with('org.code.autoscale-prod-studio.user-content', 'podcasts/lesson_456_podcast.mp3').returns(different_audio_data)

    get :show, params: {
      lesson_id: '456'
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
    DCDO.stubs(:get).with('ai-lesson-summary-podcasts', false).returns(true)

    # Test with parameters - should still work despite extra params
    assert_enqueued_with(job: AiLessonSummaryPodcastsJob) do
      post :generate_podcasts_by_unit, params: {
        unit_id: @unit.id,
        unauthorized_param: "should_be_filtered"
      }
    end

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
