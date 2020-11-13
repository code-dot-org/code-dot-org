# require_relative '../test_helper'
# Temporary:
require 'minitest/autorun'
require 'cdo/high_frequency_reporter'
require 'tempfile'
require 'timecop'

class HighFrequencyReporterTest < MiniTest::Test
  # Second time an event happens, report it to slack
  def test_report_on_second_event
    skip "Changed temporarily to always report errors"
    # The first time the error occurs, nothing should be reported
    # to Slack.  The Mock with no expectations ensures that for us.
    fake_slack = MiniTest::Mock.new # expects nothing

    Tempfile.create do |f|
      reporter = HighFrequencyReporter.new(fake_slack, 'fake_channel', f.path)
      reporter.load
      reporter.record "Something happened"
      # Mock will fail here if it is called
      reporter.report!
      reporter.save

      # The second time the same error occurs, it should be reported
      # to Slack.  We add a mock expectation to check that.
      fake_slack.expect :message, nil, [String, Hash]
      reporter = HighFrequencyReporter.new(fake_slack, 'fake_channel', f.path)
      reporter.load
      reporter.record "Something happened"
      reporter.report!
      reporter.save
      fake_slack.verify # message was sent
    end
  end

  # Only reports to chat client if current minute is multiple of throttle
  def test_reporting_based_on_throttle_window
    fake_slack = MiniTest::Mock.new # expects nothing

    Timecop.freeze(DateTime.parse('1st Jan 2020 00:05:00+00:00')) do
      Tempfile.create do |f|
        reporter = HighFrequencyReporter.new(fake_slack, 'fake-channel', f.path)
        reporter.load
        reporter.record "Something happened"
        # Mock will fail here if it is called
        reporter.report! 7
        reporter.save

        reporter = HighFrequencyReporter.new(fake_slack, 'fake-channel', f.path)
        reporter.load # Load "old events" to "new events"
        reporter.record "Something happened"

        fake_slack.expect :message, nil, [String, Hash]
        reporter.report! 5
        fake_slack.verify # message was sent
      end
    end
  end

  # Only alerts on events that have occurred in repeated runs
  def test_report_on_multiple_events
    skip "Changed temporarily to always report errors"
    fake_slack = MiniTest::Mock.new # expects nothing

    Tempfile.create do |f|
      reporter = HighFrequencyReporter.new(fake_slack, 'fake-channel', f.path)
      reporter.record "Something happened"
      reporter.record "Something else happened"
      reporter.save

      reporter = HighFrequencyReporter.new(fake_slack, 'fake-channel', f.path)
      reporter.load
      reporter.record "Something happened"

      assert_equal ["Something happened"], reporter.alertable_events
    end
  end
end
