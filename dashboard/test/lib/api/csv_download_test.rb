require 'test_helper'

class FakeController < ApplicationController
  include Api::CsvDownload
end

class Api::CsvDownloadTest < ::ActionController::TestCase
  setup do
    @controller = FakeController.new
  end

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

    csv = @controller.generate_csv data
    assert_equal expected_csv.strip, csv.strip
  end

  test 'titleize_with_id' do
    assert_equal 'Organizer Name', @controller.titleize_with_id('organizer_name')
    assert_equal 'Organizer Name', @controller.titleize_with_id(:organizer_name)
    assert_equal 'Account Id', @controller.titleize_with_id('account_id')
    assert_equal 'Account Id', @controller.titleize_with_id(:account_id)
  end
end
