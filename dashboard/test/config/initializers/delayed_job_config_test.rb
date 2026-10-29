require 'test_helper'

class DelayedJobConfigTest < ActiveSupport::TestCase
  let(:initializer) {Rails.root.join('config/initializers/delayed_job_config.rb')}
  let(:min_priority) {nil}
  let(:max_priority) {nil}

  before do
    @original_range = [Delayed::Worker.min_priority, Delayed::Worker.max_priority]
    CDO.stubs(:active_job_worker_min_priority).returns(min_priority)
    CDO.stubs(:active_job_worker_max_priority).returns(max_priority)
  end

  after do
    Delayed::Worker.min_priority, Delayed::Worker.max_priority = @original_range
  end

  describe 'worker priority range' do
    subject(:load_initializer) {load initializer}

    context 'without configured priorities' do
      it 'leaves the range open' do
        load_initializer
        _(Delayed::Worker.min_priority).must_be_nil
        _(Delayed::Worker.max_priority).must_be_nil
      end
    end

    context 'with blank priorities' do
      let(:min_priority) {''}
      let(:max_priority) {''}

      it 'leaves the range open' do
        load_initializer
        _(Delayed::Worker.min_priority).must_be_nil
        _(Delayed::Worker.max_priority).must_be_nil
      end
    end

    context 'with a configured maximum priority' do
      let(:max_priority) {'9'}

      it 'caps the range' do
        load_initializer
        _(Delayed::Worker.min_priority).must_be_nil
        _(Delayed::Worker.max_priority).must_equal 9
      end

      it 'filters reserved jobs by the cap' do
        load_initializer
        _(Delayed::Job.max_priority.to_sql).must_match(/priority <= .?9.?\)/)
      end

      context 'when bin/delayed_job passes priority flags' do
        it 'lets the flags override the configured range' do
          load_initializer
          Delayed::Worker.new(min_priority: 10, max_priority: nil)
          _(Delayed::Worker.min_priority).must_equal 10
          _(Delayed::Worker.max_priority).must_be_nil
        end
      end
    end
  end
end
