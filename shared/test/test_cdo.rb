require_relative 'test_helper'

class CdoTest < Minitest::Test
  def test_with_default
    # default for non-defined property
    assert_equal false, CDO.with_default(false).asdasdsd
    assert_equal true, CDO.with_default(true).asdasdsd

    # default for defined property delegates
    CDO.stubs(sdfsdf: false)
    assert_equal false, CDO.with_default(false).sdfsdf
    assert_equal false, CDO.with_default(true).sdfsdf

    CDO.stubs(sdfsdf: true)
    assert_equal true, CDO.with_default(false).sdfsdf
    assert_equal true, CDO.with_default(true).sdfsdf
  end
end
