require 'test_helper'

class Services::TeacherDirectoryVerification::DiscoveryTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  test 'discovery requires every feature flag' do
    Services::TeacherDirectoryVerification::Discovery::FEATURE_FLAGS.each do |flag|
      DCDO.set(flag, true)
    end
    assert Services::TeacherDirectoryVerification::Discovery.enabled?

    DCDO.set('teacher_directory_verification_email_enabled', false)
    refute Services::TeacherDirectoryVerification::Discovery.enabled?
  end

  test 'eligible teacher with a listed school is queued' do
    teacher = create(:teacher, :with_school_info)

    Services::TeacherDirectoryVerification::Discovery::FEATURE_FLAGS.each do |flag|
      DCDO.set(flag, true)
    end

    assert_enqueued_with(job: TeacherDirectoryVerification::DiscoverJob, args: [teacher.id]) do
      Services::TeacherDirectoryVerification::Discovery.enqueue_for(teacher)
    end
  end

  test 'discovery is not queued when a feature flag is off' do
    teacher = create(:teacher, :with_school_info)

    assert_no_enqueued_jobs do
      Services::TeacherDirectoryVerification::Discovery.enqueue_for(teacher)
    end
  end

  test 'teacher without an NCES school is ineligible' do
    teacher = build(:teacher, school_info: nil)

    refute Services::TeacherDirectoryVerification::Discovery.eligible_user?(teacher)
  end
end
