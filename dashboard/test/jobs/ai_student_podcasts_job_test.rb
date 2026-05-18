require 'test_helper'

class AiStudentPodcastsJobTest < ActiveJob::TestCase
  setup do
    @user = create(:student)
    @lesson = create(:lesson)
    @podcast = AiStudentPodcast.create!(user_id: @user.id, lesson_id: @lesson.id)
    @request = {student_podcast_data: @podcast}

    Honeybadger.stubs(:notify)
  end

  teardown do
    AiStudentPodcast.destroy_all
  end

  test 'perform delegates to AiStudentPodcastsHelper.create_and_save_to_s3 with the podcast' do
    AiStudentPodcastsHelper.expects(:create_and_save_to_s3).with(@podcast)

    AiStudentPodcastsJob.perform_now(request: @request)
  end

  test 'job is enqueued by perform_later' do
    assert_enqueued_jobs 1 do
      AiStudentPodcastsJob.perform_later(request: @request)
    end
  end

  test 'job notifies Honeybadger and re-raises when helper raises' do
    error = StandardError.new('upstream blew up')
    AiStudentPodcastsHelper.stubs(:create_and_save_to_s3).raises(error)

    Honeybadger.expects(:notify).with(
      "AiStudentPodcastsJob failed with unexpected error: upstream blew up",
      context: {request: @podcast.id}
    )

    assert_raises(StandardError) do
      AiStudentPodcastsJob.perform_now(request: @request)
    end
  end
end
