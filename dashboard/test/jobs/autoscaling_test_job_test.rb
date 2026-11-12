require 'test_helper'

class AutoscalingTestJobTest < ActiveJob::TestCase
  let(:described_instance) {described_class.new}
  let(:run_id) {'scaling-1'}
  let(:duration_seconds) {180}
  let(:output) {StringIO.new}
  let(:events) {output.string.lines.map {|line| JSON.parse(line)}}
  let(:logger) do
    Logger.new(output, formatter: proc {|_, _, _, message| "#{message}\n"})
  end

  before do
    CDO.stubs(:log).returns(logger)
  end

  describe '#queue_name' do
    subject(:queue_name) {described_instance.queue_name}

    it 'defaults to the low priority queue' do
      _queue_name.must_equal CDO.active_job_queues[:low_priority].to_s
    end
  end

  describe '#perform' do
    subject(:perform_job) do
      described_instance.perform(run_id: run_id, duration_seconds: duration_seconds)
    end

    it 'logs start and completion with run and worker identity' do
      described_instance.expects(:sleep).with(duration_seconds)
      perform_job

      _(events.pluck('event')).must_equal %w(started completed)
      events.each do |event|
        _(event['namespace']).must_equal 'autoscaling_test_job'
        _(event['run_id']).must_equal run_id
        _(event['job_id']).must_equal described_instance.job_id
        _(event['hostname']).must_equal Socket.gethostname
        _(event['pid']).must_equal Process.pid
        _(event['duration_seconds']).must_equal duration_seconds
        _(Time.iso8601(event['timestamp'])).must_be :utc?
      end
    end

    [0, 1800].each do |duration|
      context "with a duration of #{duration} seconds" do
        let(:duration_seconds) {duration}

        it 'sleeps for the requested duration' do
          described_instance.expects(:sleep).with(duration_seconds)
          perform_job
        end
      end
    end

    [-1, 1801, nil, '180', 1.5, Float::INFINITY, Float::NAN].each do |duration|
      context "with an invalid duration of #{duration.inspect}" do
        let(:duration_seconds) {duration}

        it 'rejects the duration before logging or sleeping' do
          described_instance.expects(:sleep).never

          _ {perform_job}.must_raise ArgumentError
          _(output.string).must_be_empty
        end
      end
    end

    [nil, '', ' ', 1].each do |invalid_run_id|
      context "with an invalid run ID of #{invalid_run_id.inspect}" do
        let(:run_id) {invalid_run_id}

        it 'rejects the run ID before logging or sleeping' do
          described_instance.expects(:sleep).never

          _ {perform_job}.must_raise ArgumentError
          _(output.string).must_be_empty
        end
      end
    end

    context 'when execution raises' do
      before do
        described_instance.stubs(:sleep).raises(RuntimeError, 'interrupted')
      end

      it 'propagates the error without reporting completion' do
        _ {perform_job}.must_raise RuntimeError
        _(events.pluck('event')).must_equal ['started']
      end
    end
  end

  describe '#perform_now' do
    subject(:perform_now) {restored_job.perform_now}

    let(:duration_seconds) {0}
    let(:original_job) {described_class.new(run_id: run_id, duration_seconds: duration_seconds)}
    let(:restored_job) {described_class.deserialize(original_job.serialize)}

    before do
      Cdo::Metrics.stubs(:push)
    end

    it 'performs serialized arguments with the original job ID' do
      restored_job.expects(:sleep).with(duration_seconds)
      perform_now

      _(events.pluck('event')).must_equal %w(started completed)
      _(events.pluck('job_id')).must_equal [original_job.job_id, original_job.job_id]
      _(events.pluck('run_id')).must_equal [run_id, run_id]
    end
  end
end
