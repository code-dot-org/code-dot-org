# frozen_string_literal: true

require 'test_helper'

class Metrics::EventsTest < ActiveSupport::TestCase
  describe '.log_event' do
    let(:stable_id) {SecureRandom.uuid}

    before do
      CDO.stubs(:rack_env).returns(:production)
      Cdo::StatsigInitializer.stubs(:init)
    end

    it 'logs Statsig stable ID of request' do
      request = stub(statsig_stable_id: stable_id)
      Statsig.expects(:log_event).with {|statsig_user, event_name| event_name == 'test_event' && statsig_user.custom_ids['stableID'] == stable_id}

      Metrics::Events.log_event(event_name: 'test_event', request:)
    end

    it 'logs no Statsig stable ID without request' do
      Statsig.expects(:log_event).with {|statsig_user, event_name| event_name == 'test_event' && statsig_user.custom_ids['stableID'].nil?}

      Metrics::Events.log_event(event_name: 'test_event')
    end
  end
end
