require 'test_helper'

class PilotTest < ActiveSupport::TestCase
  test 'pilots with valid names are valid' do
    VALID_NAMES = [
      'test-pilot-2020', # this is the preferred format
      'testpilot2020',
      'a',
      '12345'
    ]

    VALID_NAMES.each do |name|
      pilot = build :pilot, name: name
      assert pilot.valid?
    end
  end

  test 'pilots with invalid names are invalid' do
    INVALID_NAMES = [
      'TestPilot2020',
      'test_pilot_2020',
      'test pilot 2020',
      ''
    ]

    INVALID_NAMES.each do |name|
      pilot = build :pilot, name: name, display_name: 'A Pilot'
      refute pilot.valid?
    end
  end

  test 'pilot without display name is invalid' do
    pilot = build :pilot, display_name: nil
    refute pilot.valid?
  end

  test 'pilot with empty display name is invalid' do
    pilot = build :pilot, display_name: ''
    refute pilot.valid?
  end
end
