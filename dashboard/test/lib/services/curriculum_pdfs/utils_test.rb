require 'test_helper'

class Services::CurriculumPdfs::UtilsTest < ActiveSupport::TestCase
  test 'timestamp equality can compare Times and Strings' do
    assert Services::CurriculumPdfs.timestamps_equal(
      Time.new(2007, 1, 29, 12, 34, 56),
      "2007-01-29 12:34:56"
    )

    refute Services::CurriculumPdfs.timestamps_equal(
      Time.new(2007, 1, 29, 12, 34),
      "2007-01-29 12:34:56"
    )

    assert Services::CurriculumPdfs.timestamps_equal(
      "20070129123456",
      "2007-01-29 12:34:56"
    )

    assert Services::CurriculumPdfs.timestamps_equal(
      "20070129123456",
      Time.parse("2007-01-29 12:34:56")
    )
  end
end
