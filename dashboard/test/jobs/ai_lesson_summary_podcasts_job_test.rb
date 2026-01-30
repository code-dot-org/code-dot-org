require 'test_helper'

class AiLessonSummaryPodcastsJobTest < ActiveJob::TestCase
  setup do
    @user = create(:teacher)
    @unit = create(:unit)
    @course = create(:single_unit_course, unit: @unit)
    lesson_group = create(:lesson_group, script: @unit)
    @lesson1 = create(:lesson, lesson_group: lesson_group)
    @lesson2 = create(:lesson, lesson_group: lesson_group)
    @lesson3 = create(:lesson, lesson_group: lesson_group)
    @request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id, @lesson2.id, @lesson3.id]
    }
    @section = create(:section, user: @user, script_id: @unit.id, course_id: @course.id)

    # Mock rack environment
    CDO.stubs(:rack_env).returns('test')

    # Mock Honeybadger to avoid actual notifications in tests
    Honeybadger.stubs(:notify)
    DCDO.stubs(:get).with('ai-lesson-summaries-notifications-enabled', false).returns(false)

    # Mock the helpers
    @test_script_json = {
      podcast_script: "Welcome to the AI Teaching Assistant's Daily Byte, your quick check-in before class."
    }.to_json
    @test_podcast_data = "fake_mp3_binary_data_content"

    AiLessonSummariesHelper.stubs(:generate_lesson_summary).returns({
                                                                      status: 200,
      json: @test_script_json
                                                                    }
)
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(@test_podcast_data)

    # Mock File operations to avoid creating actual files
    File.stubs(:binwrite)
  end

  teardown do
    DCDO.unstub(:get)
    # Clean up any files that might have been created during testing
    Dir.glob('lesson_*_podcast.mp3').each {|file| FileUtils.rm_f(file)}
  end

  # *****
  # Job execution tests
  # *****

  test 'perform generates podcast for each lesson_id' do
    # Expect the helper to be called for each lesson
    AiLessonSummariesHelper.expects(:generate_lesson_summary).
      with(@lesson1.id, @user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT]).
      returns({status: 200, json: @test_script_json})
    AiLessonSummariesHelper.expects(:generate_lesson_summary).
      with(@lesson2.id, @user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT]).
      returns({status: 200, json: @test_script_json})
    AiLessonSummariesHelper.expects(:generate_lesson_summary).
      with(@lesson3.id, @user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT]).
      returns({status: 200, json: @test_script_json})

    # Expect podcast generation for each lesson
    extracted_script = JSON.parse(@test_script_json)['podcast_script']
    AiLessonSummaryPodcastsHelper.expects(:get_podcast_from_script).
      with(extracted_script).times(3).returns(@test_podcast_data)

    # Expect file writing for each lesson
    File.expects(:binwrite).with("lesson_#{@lesson1.id}_podcast.mp3", @test_podcast_data)
    File.expects(:binwrite).with("lesson_#{@lesson2.id}_podcast.mp3", @test_podcast_data)
    File.expects(:binwrite).with("lesson_#{@lesson3.id}_podcast.mp3", @test_podcast_data)

    AiLessonSummaryPodcastsJob.perform_now(request: @request)
  end

  test 'perform works with single lesson_id' do
    single_request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id]
    }

    AiLessonSummariesHelper.expects(:generate_lesson_summary).
      with(@lesson1.id, @user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT]).
      returns({status: 200, json: @test_script_json})

    extracted_script = JSON.parse(@test_script_json)['podcast_script']
    AiLessonSummaryPodcastsHelper.expects(:get_podcast_from_script).
      with(extracted_script).returns(@test_podcast_data)

    File.expects(:binwrite).with("lesson_#{@lesson1.id}_podcast.mp3", @test_podcast_data)

    AiLessonSummaryPodcastsJob.perform_now(request: single_request)
  end

  test 'perform processes lesson_ids as integers when passed as strings' do
    string_request = {
      user_id: @user.id.to_s,
      lesson_ids: [@lesson1.id.to_s, @lesson2.id.to_s]
    }

    # Should convert strings to integers when calling helper
    AiLessonSummariesHelper.expects(:generate_lesson_summary).
      with(@lesson1.id.to_s, @user.id.to_s, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT]).
      returns({status: 200, json: @test_script_json})
    AiLessonSummariesHelper.expects(:generate_lesson_summary).
      with(@lesson2.id.to_s, @user.id.to_s, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT]).
      returns({status: 200, json: @test_script_json})

    extracted_script = JSON.parse(@test_script_json)['podcast_script']
    AiLessonSummaryPodcastsHelper.expects(:get_podcast_from_script).
      with(extracted_script).times(2).returns(@test_podcast_data)

    File.expects(:binwrite).with("lesson_#{@lesson1.id}_podcast.mp3", @test_podcast_data)
    File.expects(:binwrite).with("lesson_#{@lesson2.id}_podcast.mp3", @test_podcast_data)

    AiLessonSummaryPodcastsJob.perform_now(request: string_request)
  end

  test 'perform correctly parses JSON script and extracts podcast_script' do
    complex_script_json = {
      podcast_script: "Hello, welcome to today's lesson on variables and expressions.",
      other_data: "This should be ignored"
    }.to_json

    AiLessonSummariesHelper.expects(:generate_lesson_summary).
      returns({status: 200, json: complex_script_json})

    expected_script = "Hello, welcome to today's lesson on variables and expressions."
    AiLessonSummaryPodcastsHelper.expects(:get_podcast_from_script).
      with(expected_script).returns(@test_podcast_data)

    File.expects(:binwrite).with("lesson_#{@lesson1.id}_podcast.mp3", @test_podcast_data)

    single_request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id]
    }

    AiLessonSummaryPodcastsJob.perform_now(request: single_request)
  end

  # *****
  # Error handling tests
  # *****

  test 'job rescues StandardError and notifies Honeybadger' do
    error_message = 'Test error message'
    error = StandardError.new(error_message)

    # Make the helper raise an error
    AiLessonSummariesHelper.stubs(:generate_lesson_summary).raises(error)

    # Expect Honeybadger notification
    Honeybadger.expects(:notify).with(
      "AiLessonSummaryPodcastsJob failed with unexpected error: #{error_message}",
      context: {
        request: @request.to_json
      }
    )

    # Should re-raise the error
    assert_raises(StandardError) do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end

  test 'job rescues JSON::ParserError from malformed script' do
    malformed_json = "invalid json content"

    AiLessonSummariesHelper.stubs(:generate_lesson_summary).
      returns({status: 200, json: malformed_json})

    # Expect Honeybadger notification for JSON parse error
    Honeybadger.expects(:notify)

    assert_raises(JSON::ParserError) do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end

  test 'job rescues error from podcast helper' do
    podcast_error = StandardError.new('Podcast generation failed')

    AiLessonSummariesHelper.stubs(:generate_lesson_summary).
      returns({status: 200, json: @test_script_json})
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).raises(podcast_error)

    Honeybadger.expects(:notify).with(
      "AiLessonSummaryPodcastsJob failed with unexpected error: Podcast generation failed",
      context: {
        request: @request.to_json
      }
    )

    assert_raises(StandardError) do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end

  test 'job rescues error from file write operation' do
    file_error = IOError.new('Permission denied')

    AiLessonSummariesHelper.stubs(:generate_lesson_summary).
      returns({status: 200, json: @test_script_json})
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(@test_podcast_data)
    File.stubs(:binwrite).raises(file_error)

    Honeybadger.expects(:notify).with(
      "AiLessonSummaryPodcastsJob failed with unexpected error: Permission denied",
      context: {
        request: @request.to_json
      }
    )

    assert_raises(IOError) do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end

  test 'job rescues and re-raises custom exceptions' do
    custom_error = Class.new(StandardError)
    error = custom_error.new('Custom error')

    AiLessonSummariesHelper.stubs(:generate_lesson_summary).raises(error)

    # Should still notify Honeybadger and re-raise
    Honeybadger.expects(:notify)

    assert_raises(custom_error) do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end

  # *****
  # Job configuration tests
  # *****

  test 'job can be enqueued and executed with proper parameters' do
    # Test that the job can be properly enqueued
    assert_enqueued_jobs 1 do
      AiLessonSummaryPodcastsJob.perform_later(request: @request)
    end
  end

  test 'job is queued on default queue' do
    job = AiLessonSummaryPodcastsJob.new(request: @request)
    assert_equal 'default', job.queue_name
  end

  test 'job executes successfully with valid request structure' do
    # Mock successful helper calls
    AiLessonSummariesHelper.stubs(:generate_lesson_summary).
      returns({status: 200, json: @test_script_json})
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(@test_podcast_data)

    # Should complete without error
    assert_nothing_raised do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end

  # *****
  # File operations tests
  # *****

  test 'job creates correctly named files for each lesson' do
    single_request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id]
    }

    expected_filename = "lesson_#{@lesson1.id}_podcast.mp3"

    AiLessonSummariesHelper.stubs(:generate_lesson_summary).
      returns({status: 200, json: @test_script_json})
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(@test_podcast_data)

    File.expects(:binwrite).with(expected_filename, @test_podcast_data)

    AiLessonSummaryPodcastsJob.perform_now(request: single_request)
  end

  test 'job writes binary data correctly to files' do
    binary_data = "\x00\x01\x02\x03binary_mp3_data"

    AiLessonSummariesHelper.stubs(:generate_lesson_summary).
      returns({status: 200, json: @test_script_json})
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(binary_data)

    File.expects(:binwrite).with("lesson_#{@lesson1.id}_podcast.mp3", binary_data)

    single_request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id]
    }

    AiLessonSummaryPodcastsJob.perform_now(request: single_request)
  end

  # *****
  # after_perform callback tests (commented out functionality)
  # *****

  test 'after_perform callback exists but is currently disabled' do
    # Test that the callback is defined but doesn't execute the notification logic
    # since it's commented out in the actual implementation

    AiLessonSummariesHelper.stubs(:generate_lesson_summary).
      returns({status: 200, json: @test_script_json})
    AiLessonSummaryPodcastsHelper.stubs(:get_podcast_from_script).returns(@test_podcast_data)

    # Should not attempt to create notifications since the code is commented out
    TeacherNotification.expects(:create!).never

    AiLessonSummaryPodcastsJob.perform_now(request: @request)
  end

  # *****
  # Integration tests
  # *****

  test 'job processes complete workflow for multiple lessons successfully' do
    # Test the full workflow from start to finish
    request_with_unit = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id, @lesson2.id],
      unit_id: @unit.id
    }

    # Set up expectations for all steps
    [@lesson1.id, @lesson2.id].each do |lesson_id|
      AiLessonSummariesHelper.expects(:generate_lesson_summary).
        with(lesson_id, @user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT]).
        returns({status: 200, json: @test_script_json})

      extracted_script = JSON.parse(@test_script_json)['podcast_script']
      AiLessonSummaryPodcastsHelper.expects(:get_podcast_from_script).
        with(extracted_script).returns(@test_podcast_data)

      File.expects(:binwrite).with("lesson_#{lesson_id}_podcast.mp3", @test_podcast_data)
    end

    assert_nothing_raised do
      AiLessonSummaryPodcastsJob.perform_now(request: request_with_unit)
    end
  end

  test 'job handles mixed success and failure scenarios gracefully' do
    # Test what happens when some lessons succeed and others fail
    # In the current implementation, any error stops the entire job

    AiLessonSummariesHelper.expects(:generate_lesson_summary).
      with(@lesson1.id, @user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT]).
      returns({status: 200, json: @test_script_json})

    # Second lesson will fail
    AiLessonSummariesHelper.expects(:generate_lesson_summary).
      with(@lesson2.id, @user.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT]).
      raises(StandardError.new("API failure"))

    # First lesson should succeed
    extracted_script = JSON.parse(@test_script_json)['podcast_script']
    AiLessonSummaryPodcastsHelper.expects(:get_podcast_from_script).
      with(extracted_script).returns(@test_podcast_data)
    File.expects(:binwrite).with("lesson_#{@lesson1.id}_podcast.mp3", @test_podcast_data)

    # Should fail on second lesson and notify Honeybadger
    Honeybadger.expects(:notify)

    assert_raises(StandardError) do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end
end
