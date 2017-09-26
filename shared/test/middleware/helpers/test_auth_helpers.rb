require_relative '../../test_helper'
require_relative '../../../middleware/helpers/auth_helpers'

class AuthHelpersTest < Minitest::Test
  def test_get_sharing_disabled_from_properties
    properties = {
      setting: 'setting',
      sharing_disabled: true
    }.to_json
    assert get_sharing_disabled_from_properties(properties)

    properties = {
      setting: 'setting',
      sharing_disabled: false
    }.to_json
    refute get_sharing_disabled_from_properties(properties)

    properties = {
      setting: 'setting'
    }.to_json
    refute get_sharing_disabled_from_properties(properties)

    properties = {}.to_json
    refute get_sharing_disabled_from_properties(properties)

    properties = nil
    refute get_sharing_disabled_from_properties(properties)
  end

  def test_get_user_sharing_disabled
    mock_select = mock
    mock_select.expects(:first).returns({properties: nil}).
      then.returns({properties: {sharing_disabled: true}.to_json}).twice
    mock_table = mock
    mock_table.expects(:select).returns(mock_select).twice
    DASHBOARD_DB.expects(:[]).with(:users).returns(mock_table).twice
    # If user is not found, default to false
    refute get_user_sharing_disabled(123)
    assert get_user_sharing_disabled(123)
  end
end
