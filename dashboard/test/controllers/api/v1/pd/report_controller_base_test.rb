require 'test_helper'

class Api::V1::Pd::ReportControllerBaseTest < ::ActionController::TestCase
  test 'generate_csv' do
    data = [
      {organizer_name: 'Organizer1', district: 'district1'},
      {organizer_name: 'Organizer2', district: 'district2'},
      {organizer_name: 'Organizer3', district: 'district3'}
    ]

    expected_csv = [
      'Organizer Name,District',
      'Organizer1,district1',
      'Organizer2,district2',
      'Organizer3,district3'
    ].join("\n")

    csv = Api::V1::Pd::ReportControllerBase.new.generate_csv data
    assert_equal expected_csv.strip, csv.strip
  end
end
