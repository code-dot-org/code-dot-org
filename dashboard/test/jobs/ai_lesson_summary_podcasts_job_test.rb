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

    # Mock the new S3-based helper method
    AiLessonSummaryPodcastsHelper.stubs(:create_and_save_to_s3)

    # Mock AWS S3 operations
    AWS::S3.stubs(:exists_in_bucket).returns(false)
    AWS::S3.stubs(:upload_to_bucket)
    AWS::S3.stubs(:download_from_bucket)
  end

  teardown do
    DCDO.unstub(:get)
  end

  # *****
  # Job execution tests
  # *****

  test 'perform creates podcast for each lesson_id through S3' do
    # Expect the helper to be called for each lesson
    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson1.id, @user.id)
    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson2.id, @user.id)
    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson3.id, @user.id)

    AiLessonSummaryPodcastsJob.perform_now(request: @request)
  end

  test 'perform works with single lesson_id' do
    single_request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id]
    }

    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson1.id, @user.id)

    AiLessonSummaryPodcastsJob.perform_now(request: single_request)
  end

  test 'perform processes lesson_ids when passed as strings' do
    string_request = {
      user_id: @user.id.to_s,
      lesson_ids: [@lesson1.id.to_s, @lesson2.id.to_s]
    }

    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson1.id.to_s, @user.id.to_s)
    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson2.id.to_s, @user.id.to_s)

    AiLessonSummaryPodcastsJob.perform_now(request: string_request)
  end

  test 'perform delegates script processing to helper method' do
    single_request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id]
    }

    # The JSON parsing and script extraction is now handled by the helper
    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson1.id, @user.id)

    AiLessonSummaryPodcastsJob.perform_now(request: single_request)
  end

  # *****
  # Error handling tests
  # *****

  test 'job rescues StandardError and notifies Honeybadger' do
    error_message = 'Test error message'
    error = StandardError.new(error_message)

    # Make the helper raise an error
    AiLessonSummaryPodcastsHelper.stubs(:create_and_save_to_s3).raises(error)

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

  test 'job rescues errors from S3 helper and notifies Honeybadger' do
    s3_error = StandardError.new('S3 upload failed')

    AiLessonSummaryPodcastsHelper.stubs(:create_and_save_to_s3).raises(s3_error)

    # Expect Honeybadger notification for S3 error
    Honeybadger.expects(:notify).with(
      "AiLessonSummaryPodcastsJob failed with unexpected error: S3 upload failed",
      context: {
        request: @request.to_json
      }
    )

    assert_raises(StandardError) do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end

  test 'job rescues timeout errors from S3 helper' do
    timeout_error = Net::OpenTimeout.new('Request timeout')

    AiLessonSummaryPodcastsHelper.stubs(:create_and_save_to_s3).raises(timeout_error)

    Honeybadger.expects(:notify).with(
      "AiLessonSummaryPodcastsJob failed with unexpected error: Request timeout",
      context: {
        request: @request.to_json
      }
    )

    assert_raises(Net::OpenTimeout) do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end

  test 'job rescues database errors from lesson summary retrieval' do
    db_error = ActiveRecord::RecordNotFound.new('Lesson not found')

    AiLessonSummaryPodcastsHelper.stubs(:create_and_save_to_s3).raises(db_error)

    Honeybadger.expects(:notify).with(
      "AiLessonSummaryPodcastsJob failed with unexpected error: Lesson not found",
      context: {
        request: @request.to_json
      }
    )

    assert_raises(ActiveRecord::RecordNotFound) do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end

  test 'job rescues and re-raises custom exceptions' do
    custom_error = Class.new(StandardError)
    error = custom_error.new('Custom error')

    AiLessonSummaryPodcastsHelper.stubs(:create_and_save_to_s3).raises(error)

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
    AiLessonSummaryPodcastsHelper.stubs(:create_and_save_to_s3)

    # Should complete without error
    assert_nothing_raised do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end

  # *****
  # S3 integration tests
  # *****

  test 'job calls S3 helper with correct parameters for each lesson' do
    single_request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id]
    }

    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson1.id, @user.id)

    AiLessonSummaryPodcastsJob.perform_now(request: single_request)
  end

  test 'job processes multiple lessons with S3 storage' do
    multi_request = {
      user_id: @user.id,
      lesson_ids: [@lesson1.id, @lesson2.id]
    }

    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson1.id, @user.id)
    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson2.id, @user.id)

    AiLessonSummaryPodcastsJob.perform_now(request: multi_request)
  end

  # *****
  # after_perform callback tests
  # *****

  test 'after_perform callback does not create notification when notifications disabled' do
    # notifications are disabled by default in test setup
    AiLessonSummaryPodcastsHelper.stubs(:create_and_save_to_s3)

    # Should not attempt to create notifications when disabled
    TeacherNotification.expects(:create!).never

    AiLessonSummaryPodcastsJob.perform_now(request: @request)
  end

  test 'after_perform callback creates notification when notifications enabled' do
    DCDO.stubs(:get).with('ai-lesson-summaries-notifications-enabled', false).returns(true)

    AiLessonSummaryPodcastsHelper.stubs(:create_and_save_to_s3)

    # Should create notification when enabled
    TeacherNotification.expects(:create!).with(
      user_id: @user.id,
      title: 'Your AI Lesson Summary Podcasts are ready',
      description: "Your lesson summary podcasts for 3 lessons for #{@unit.title_for_display} are live — prepare for your next class in minutes!",
      icon_name: 'solid-flask-sparkle',
      icon_color: 'Aqua',
      href_links: [{text: 'View lesson materials',
                   url: "/teacher_dashboard/sections/#{@section.id}/materials"}]
    )

    AiLessonSummaryPodcastsJob.perform_now(request: @request.merge(unit_id: @unit.id))
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

    # Set up expectations for S3 upload for each lesson
    [@lesson1.id, @lesson2.id].each do |lesson_id|
      AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
        with(lesson_id, @user.id)
    end

    assert_nothing_raised do
      AiLessonSummaryPodcastsJob.perform_now(request: request_with_unit)
    end
  end

  test 'job handles mixed success and failure scenarios gracefully' do
    # Test what happens when some lessons succeed and others fail
    # In the current implementation, any error stops the entire job

    # First lesson succeeds
    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson1.id, @user.id)

    # Second lesson fails
    AiLessonSummaryPodcastsHelper.expects(:create_and_save_to_s3).
      with(@lesson2.id, @user.id).
      raises(StandardError.new("S3 upload failure"))

    # Should fail on second lesson and notify Honeybadger
    Honeybadger.expects(:notify).with(
      "AiLessonSummaryPodcastsJob failed with unexpected error: S3 upload failure",
      context: {
        request: @request.to_json
      }
    )

    assert_raises(StandardError) do
      AiLessonSummaryPodcastsJob.perform_now(request: @request)
    end
  end
end
