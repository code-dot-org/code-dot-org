require_relative '../../test_helper'
require 'cdo/pegasus'

class FileUtilityTest < Minitest::Test
  def test_find_first_existing
    # Paths are resolved relative to the cwd, which is lib/ when the lib test
    # suite runs; test/test_helper.rb is a stable file that exists there.
    assert_equal 'test/test_helper.rb',
      FileUtility.find_first_existing(
        [
          'test/does_not_exist',
          'test/test_helper.rb',
          'test/also_does_not_exist',
        ]
      )

    assert_nil FileUtility.find_first_existing(
      'test/does_not_exist',
      'test/also_does_not_exist'
    )
  end
end
