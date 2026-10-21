require 'test_helper'

class DelayedJobConfigTest < ActiveSupport::TestCase
  INITIALIZER = Rails.root.join('config/initializers/delayed_job_config.rb').freeze

  setup do
    @min_priority = Delayed::Worker.min_priority
    @max_priority = Delayed::Worker.max_priority
  end

  teardown do
    Delayed::Worker.min_priority = @min_priority
    Delayed::Worker.max_priority = @max_priority
  end

  test 'leaves the priority range open when nothing is configured' do
    CDO.stubs(:active_job_worker_min_priority).returns(nil)
    CDO.stubs(:active_job_worker_max_priority).returns(nil)

    load INITIALIZER

    assert_nil Delayed::Worker.min_priority
    assert_nil Delayed::Worker.max_priority
  end

  test 'treats a blank value as unset' do
    CDO.stubs(:active_job_worker_min_priority).returns('')
    CDO.stubs(:active_job_worker_max_priority).returns('')

    load INITIALIZER

    assert_nil Delayed::Worker.min_priority
    assert_nil Delayed::Worker.max_priority
  end

  test 'caps the priority range from configuration' do
    CDO.stubs(:active_job_worker_min_priority).returns(nil)
    CDO.stubs(:active_job_worker_max_priority).returns('9')

    load INITIALIZER

    assert_nil Delayed::Worker.min_priority
    assert_equal 9, Delayed::Worker.max_priority
    assert_match(/priority <= .?9.?\)/, Delayed::Job.max_priority.to_sql)
  end

  test 'bin/delayed_job flags override the configured range' do
    CDO.stubs(:active_job_worker_min_priority).returns(nil)
    CDO.stubs(:active_job_worker_max_priority).returns(9)

    load INITIALIZER
    Delayed::Worker.new(min_priority: 10, max_priority: nil)

    assert_equal 10, Delayed::Worker.min_priority
    assert_nil Delayed::Worker.max_priority
  end
end
