require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class FileUtilityTest < Minitest::Test
  def test_find_first_existing
    assert_equal 'test/test_hash.rb', FileUtility.find_first_existing([
      'test/does_not_exist',
      'test/test_hash.rb',
      'test/also_does_not_exist',
    ])

    assert_equal nil, FileUtility.find_first_existing('test/does_not_exist', 'test/also_does_not_exist')
  end
end
