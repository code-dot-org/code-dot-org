# require_relative '../test_helper'
# Temporary:
require 'minitest/autorun'
require 'cdo/high_frequency_reporter'
require 'tempfile'
require 'timecop'

class HighFrequencyReporterTest < MiniTest::Test
  # Second time an event happens, report it to slack
  def test_report_on_second_event
    Tempfile.create do |f|
      # The first time the error occurs, nothing should be reported
      # to Slack.  The Mock with no expectations ensures that for us.
      fake_slack = MiniTest::Mock.new # expects nothing

      obj = HighFrequencyReporter.new(fake_slack, f.path)
      obj.load
      obj.record "Something happened"
      # Mock will fail here if it is called
      obj.report!
      obj.save

      # The second time the same error occurs, it should be reported
      # to Slack.  We add a mock expectation to check that.
      fake_slack.expect :message, nil, [String]
      obj = HighFrequencyReporter.new(fake_slack, f.path)
      obj.load
      obj.record "Something happened"
      obj.report!
      obj.save
      fake_slack.verify # message was sent
    end
  end

  # Next time it happens after the throttle window, do report to Slack
  def test_reporting_based_on_throttle_window
    fake_slack = MiniTest::Mock.new # expects nothing

    Timecop.freeze(DateTime.new(2001,1,1,1,7,1)) do
      Tempfile.create do |f|
        obj = HighFrequencyReporter.new(fake_slack, f.path)
        obj.load
        obj.record "Something happened"
        # Mock will fail here if it is called
        obj.report! 5

        puts Time.now.min
        # The second time the same error occurs, it should be reported
        # to Slack.  We add a mock expectation to check that.
        fake_slack.expect :message, nil, [String]
        obj.report! 7
        fake_slack.verify # message was sent
      end
    end
  end
=begin
  # check whether newly recorded errors are now accessible via load
  def test_new_events_override_old_events_on_save
    Tempfile.create do |f|
      obj = HighFrequencyReporter.new(fake_slack, f.path)
      obj.record "Something happened"
      obj.save

      obj.load
      assert_equal 'Something happened', obj.old_events.first[:name]
    end
  end
=end
end
