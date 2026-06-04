require_relative '../../test_helper'
require 'cdo/pegasus'

class FileUtilityTest < Minitest::Test
  def test_find_first_existing
    assert_equal 'test/cdo/pegasus/test_file_utility.rb',
      FileUtility.find_first_existing(
        [
          'test/does_not_exist',
          'test/cdo/pegasus/test_file_utility.rb',
          'test/also_does_not_exist',
        ]
      )

    assert_nil FileUtility.find_first_existing(
      'test/does_not_exist',
      'test/also_does_not_exist'
    )
  end
end
