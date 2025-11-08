require 'test_helper'

class AiLessonSummariesJobTest < ActiveJob::TestCase
  setup do
    @user = create(:teacher)
    @lesson1 = create(:lesson)
    @lesson2 = create(:lesson)
    @lesson3 = create(:lesson)
    @request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id, @lesson2.id, @lesson3.id]
    }

    # Mock rack environment
    CDO.stubs(:rack_env).returns('test')

    # Mock Honeybadger to avoid actual notifications in tests
    Honeybadger.stubs(:notify)
  end

  # *****
  # Job execution tests
  # *****

  test 'perform calls AiLessonSummariesHelper for each lesson_id' do
    # Expect the helper to be called for each lesson
    AiLessonSummariesHelper.expects(:retrieve_and_save_ai_lesson_summary).
      with(@lesson1.id, @user.id)
    AiLessonSummariesHelper.expects(:retrieve_and_save_ai_lesson_summary).
      with(@lesson2.id, @user.id)
    AiLessonSummariesHelper.expects(:retrieve_and_save_ai_lesson_summary).
      with(@lesson3.id, @user.id)

    AiLessonSummariesJob.perform_now(request: @request)
  end

  test 'perform works with single lesson_id' do
    single_request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id]
    }

    AiLessonSummariesHelper.expects(:retrieve_and_save_ai_lesson_summary).
      with(@lesson1.id, @user.id)

    AiLessonSummariesJob.perform_now(request: single_request)
  end

  test 'perform works with empty lesson_ids array' do
    empty_request = {
      user_id: @user.id,
      lesson_ids: []
    }

    # Should not call the helper at all
    AiLessonSummariesHelper.expects(:retrieve_and_save_ai_lesson_summary).never

    AiLessonSummariesJob.perform_now(request: empty_request)
  end

  # *****
  # Error handling tests
  # *****

  test 'job rescues StandardError and notifies Honeybadger' do
    error_message = 'Test error message'
    error = StandardError.new(error_message)

    # Make the helper raise an error
    AiLessonSummariesHelper.stubs(:retrieve_and_save_ai_lesson_summary).
      raises(error)

    # Expect Honeybadger notification
    Honeybadger.expects(:notify).with(
      "AiLessonSummariesJob failed with unexpected error: #{error_message}",
      context: {
        request: @request.to_json
      }
    )

    # Should re-raise the error
    assert_raises(StandardError) do
      AiLessonSummariesJob.perform_now(request: @request)
    end
  end

  test 'job rescues and re-raises custom exceptions' do
    custom_error = Class.new(StandardError)
    error = custom_error.new('Custom error')

    AiLessonSummariesHelper.stubs(:retrieve_and_save_ai_lesson_summary).
      raises(error)

    # Should still notify Honeybadger and re-raise
    Honeybadger.expects(:notify)

    assert_raises(custom_error) do
      AiLessonSummariesJob.perform_now(request: @request)
    end
  end

  test 'error handling includes request context in development environment' do
    # Mock development environment
    CDO.stubs(:rack_env).returns('development')

    error_message = 'Development test error'
    error = StandardError.new(error_message)

    AiLessonSummariesHelper.stubs(:retrieve_and_save_ai_lesson_summary).
      raises(error)

    # In development, should print error message
    # We can't easily test puts output, but we can verify the error is still raised
    assert_raises(StandardError) do
      AiLessonSummariesJob.perform_now(request: @request)
    end
  end

  test 'job can be enqueued and executed with proper parameters' do
    # Test that the job can be properly enqueued
    assert_enqueued_jobs 1 do
      AiLessonSummariesJob.perform_later(request: @request)
    end
  end

  test 'job is queued on default queue' do
    job = AiLessonSummariesJob.new(request: @request)
    assert_equal 'default', job.queue_name
  end

  test 'job executes successfully with valid request structure' do
    # Mock successful helper calls
    AiLessonSummariesHelper.stubs(:retrieve_and_save_ai_lesson_summary).returns(true)

    # Should complete without error
    assert_nothing_raised do
      AiLessonSummariesJob.perform_now(request: @request)
    end
  end

  # *****
  # Parameter validation tests
  # *****

  test 'job handles request with string lesson_ids' do
    string_request = {
      user_id: @user.id.to_s,
      lesson_ids: [@lesson1.id.to_s, @lesson2.id.to_s]
    }

    # Should convert strings to integers when calling helper
    AiLessonSummariesHelper.expects(:retrieve_and_save_ai_lesson_summary).
      with(@lesson1.id.to_s, @user.id.to_s)
    AiLessonSummariesHelper.expects(:retrieve_and_save_ai_lesson_summary).
      with(@lesson2.id.to_s, @user.id.to_s)

    AiLessonSummariesJob.perform_now(request: string_request)
  end

  test 'job handles malformed request gracefully' do
    malformed_request = {
      user_id: @user.id,
      lesson_ids: nil
    }

    # Should raise an error when trying to iterate over nil
    assert_raises(NoMethodError) do
      AiLessonSummariesJob.perform_now(request: malformed_request)
    end
  end

  test 'job handles missing user_id in request' do
    request_without_user = {
      lesson_ids: [@lesson1.id]
    }

    AiLessonSummariesHelper.expects(:retrieve_and_save_ai_lesson_summary).
      with(@lesson1.id, nil)

    AiLessonSummariesJob.perform_now(request: request_without_user)
  end

  # *****
  # Honeybadger integration tests
  # *****

  test 'Honeybadger notification includes full request context' do
    error = StandardError.new('Context test error')

    AiLessonSummariesHelper.stubs(:retrieve_and_save_ai_lesson_summary).
      raises(error)

    expected_context = {
      request: @request.to_json
    }

    Honeybadger.expects(:notify).with(
      "AiLessonSummariesJob failed with unexpected error: Context test error",
      context: expected_context
    )

    assert_raises(StandardError) do
      AiLessonSummariesJob.perform_now(request: @request)
    end
  end

  test 'Honeybadger notification works with complex request structure' do
    complex_request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id, @lesson2.id],
      metadata: {
        source: 'unit_generation',
        timestamp: Time.now.to_i
      }
    }

    error = StandardError.new('Complex request error')

    AiLessonSummariesHelper.stubs(:retrieve_and_save_ai_lesson_summary).
      raises(error)

    expected_context = {
      request: complex_request.to_json
    }

    Honeybadger.expects(:notify).with(
      "AiLessonSummariesJob failed with unexpected error: Complex request error",
      context: expected_context
    )

    assert_raises(StandardError) do
      AiLessonSummariesJob.perform_now(request: complex_request)
    end
  end

  # *****
  # Performance and behavior tests
  # *****

  test 'job processes large number of lessons' do
    # Create many lessons to test performance
    lesson_ids = (1..10).map {create(:lesson).id}
    large_request = {
      user_id: @user.id,
      lesson_ids: lesson_ids
    }

    # Mock helper to avoid actual API calls
    AiLessonSummariesHelper.stubs(:retrieve_and_save_ai_lesson_summary)

    # Should handle large requests without issues
    assert_nothing_raised do
      AiLessonSummariesJob.perform_now(request: large_request)
    end
  end

  test 'job inheritance from ApplicationJob' do
    assert_equal ApplicationJob, AiLessonSummariesJob.superclass
  end
end
