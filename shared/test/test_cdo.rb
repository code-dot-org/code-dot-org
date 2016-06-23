require_relative 'test_helper'

class CdoTest < Minitest::Test
  def test_with_default
    # default for non-defined property
    assert_equal false, CDO.with_default(false).asdasdsd
    assert_equal true, CDO.with_default(true).asdasdsd

    # default for defined property delegates
    CDO.sdfsdf = false
    assert_equal false, CDO.with_default(false).sdfsdf
    assert_equal false, CDO.with_default(true).sdfsdf

    CDO.sdfsdf = true
    assert_equal true, CDO.with_default(false).sdfsdf
    assert_equal true, CDO.with_default(true).sdfsdf

    # non-boolean delegates
    assert_equal CDO.pegasus_db_writer, CDO.with_default(false).pegasus_db_writer
    assert_equal CDO.pegasus_db_writer, CDO.with_default(true).pegasus_db_writer
  end
end
