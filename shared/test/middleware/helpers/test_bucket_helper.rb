require_relative '../../test_helper'
require_relative '../../../middleware/helpers/bucket_helper'

class BucketHelperTest < Minitest::Test
  def test_replace_unsafe_chars
    safe_string = "the-quick_brown'fox'jumped(over)the*lazy-dog"
    assert_equal safe_string, BucketHelper.replace_unsafe_chars(safe_string)

    unsafe_string = 'a?b$c%d<e"f&g h'
    safe_string = 'a-b-c-d-e-f-g-h'
    assert_equal safe_string, BucketHelper.replace_unsafe_chars(unsafe_string)
  end
end
