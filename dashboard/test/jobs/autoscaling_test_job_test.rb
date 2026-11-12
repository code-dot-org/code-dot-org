require 'test_helper'

class AutoscalingTestJobTest < ActiveJob::TestCase
  setup do
    @job = AutoscalingTestJob.new
    @output = StringIO.new
    CDO.stubs(:log).returns(Logger.new(@output, formatter: proc {|_, _, _, message| "#{message}\n"}))
  end

  test 'defaults to the low priority queue' do
    assert_equal CDO.active_job_queues[:low_priority].to_s, @job.queue_name
  end

  test 'logs start and completion with run and worker identity' do
    @job.expects(:sleep).with(180)
    @job.perform(run_id: 'scaling-1', duration_seconds: 180)

    events = @output.string.lines.map {|line| JSON.parse(line)}
    assert_equal %w(started completed), events.pluck('event')
    events.each do |event|
      assert_equal 'autoscaling_test_job', event['namespace']
      assert_equal 'scaling-1', event['run_id']
      assert_equal @job.job_id, event['job_id']
      assert_equal Socket.gethostname, event['hostname']
      assert_equal Process.pid, event['pid']
      assert_equal 180, event['duration_seconds']
      assert Time.iso8601(event['timestamp']).utc?
    end
  end

  test 'accepts zero and the thirty minute duration limit' do
    [0, 1800].each do |duration|
      @job.expects(:sleep).with(duration)
      @job.perform(run_id: 'drain-1', duration_seconds: duration)
    end
  end

  test 'performs serialized arguments with the original job ID' do
    original = AutoscalingTestJob.new(run_id: 'serialized-1', duration_seconds: 0)
    restored = AutoscalingTestJob.deserialize(original.serialize)
    Cdo::Metrics.stubs(:push)
    restored.expects(:sleep).with(0)

    restored.perform_now

    events = @output.string.lines.map {|line| JSON.parse(line)}
    assert_equal %w(started completed), events.pluck('event')
    assert_equal [original.job_id, original.job_id], events.pluck('job_id')
    assert_equal ['serialized-1', 'serialized-1'], events.pluck('run_id')
  end

  test 'rejects invalid durations before logging or sleeping' do
    @job.expects(:sleep).never
    [-1, 1801, nil, '180', 1.5, Float::INFINITY, Float::NAN].each do |duration|
      assert_raises(ArgumentError) do
        @job.perform(run_id: 'invalid-duration', duration_seconds: duration)
      end
    end
    assert_empty @output.string
  end

  test 'requires a nonblank string run ID' do
    @job.expects(:sleep).never
    [nil, '', ' ', 1].each do |run_id|
      assert_raises(ArgumentError) do
        @job.perform(run_id: run_id, duration_seconds: 0)
      end
    end
    assert_empty @output.string
  end

  test 'does not report completion when execution raises' do
    @job.stubs(:sleep).raises(RuntimeError, 'interrupted')
    assert_raises(RuntimeError) do
      @job.perform(run_id: 'interrupted-1', duration_seconds: 180)
    end
    assert_equal ['started'], (@output.string.lines.map {|line| JSON.parse(line)['event']})
  end
end
