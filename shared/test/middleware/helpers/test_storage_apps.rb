require_relative '../../test_helper'
require_relative '../../../middleware/helpers/storage_apps'

class StorageAppsTest < Minitest::Test
  include SetupTest

  def setup
    @user_storage_ids_table = PEGASUS_DB[:user_storage_ids]
  end

  def test_get_anonymous_age_restricted_app
    signedout_storage_id = @user_storage_ids_table.insert(user_id: nil)
    signedin_storage_id = @user_storage_ids_table.insert(user_id: 20)

    # Create an applab project as signed out user
    # Other users should not be able to access app
    channel_id = StorageApps.new(signedout_storage_id).create({projectType: 'applab'}, ip: 123)
    assert_raises StorageApps::NotFound do
      StorageApps.new(signedin_storage_id).get(channel_id)
    end

    # can still get your own channel
    StorageApps.new(signedout_storage_id).get(channel_id)

    # Create an artist project as signed out user
    # Other users should be able to access it
    channel_id = StorageApps.new(signedout_storage_id).create({projectType: 'artist'}, ip: 123)
    StorageApps.new(signedin_storage_id).get(channel_id)

    # Create an applab project as a signed in user
    # Other users should be able to access app
    channel_id = StorageApps.new(signedin_storage_id).create({projectType: 'applab'}, ip: 123)
    StorageApps.new(signedout_storage_id).get(channel_id)
  end

  def test_users_paired_on_level_when_no_level
    signedin_storage_id = @user_storage_ids_table.insert(user_id: 123)
    storage_apps = StorageApps.new(signedin_storage_id)

    mock_where = mock
    mock_where.expects(:first).returns(nil).once
    mock_table = mock
    mock_table.expects(:where).returns(mock_where).once
    DASHBOARD_DB.expects(:[]).with(:channel_tokens).returns(mock_table).once

    # If there is no level associated with the channel, it's not possible for it to be paired.
    refute storage_apps.users_paired_on_level?(12345, 123, 124, 67890)
  end

  def test_users_paired_on_level_with_level_not_paired
    signedin_storage_id = @user_storage_ids_table.insert(user_id: 123)
    storage_apps = StorageApps.new(signedin_storage_id)

    mock_where = mock
    mock_where.expects(:first).returns(nil).once
    mock_table = mock
    mock_table.expects(:where).returns(mock_where).once
    DASHBOARD_DB.expects(:[]).with(:paired_user_levels).returns(mock_table).once

    mock_select = mock
    mock_select.expects(:where).returns(123).twice
    mock_table = mock
    mock_table.expects(:select).returns(mock_select).twice
    DASHBOARD_DB.expects(:[]).with(:user_levels).returns(mock_table).once

    mock_where = mock
    mock_where.expects(:first).returns({level_id: 123}).once
    mock_table = mock
    mock_table.expects(:where).returns(mock_where).once
    DASHBOARD_DB.expects(:[]).with(:channel_tokens).returns(mock_table).once

    # If there is no paired_user_level, it's not possible for it to be paired.
    refute storage_apps.users_paired_on_level?(12345, 123, 124, 67890)
  end

  def test_users_paired_on_level_with_level_paired
    signedin_storage_id = @user_storage_ids_table.insert(user_id: 123)
    storage_apps = StorageApps.new(signedin_storage_id)

    mock_where = mock
    mock_where.expects(:first).returns({paired: true}).once
    mock_table = mock
    mock_table.expects(:where).returns(mock_where).once
    DASHBOARD_DB.expects(:[]).with(:paired_user_levels).returns(mock_table).once

    mock_select = mock
    mock_select.expects(:where).returns(123).twice
    mock_table = mock
    mock_table.expects(:select).returns(mock_select).twice
    DASHBOARD_DB.expects(:[]).with(:user_levels).returns(mock_table).once

    mock_where = mock
    mock_where.expects(:first).returns({level_id: 123}).once
    mock_table = mock
    mock_table.expects(:where).returns(mock_where).once
    DASHBOARD_DB.expects(:[]).with(:channel_tokens).returns(mock_table).once

    # If there is a paired_user_level, then the level was paired.
    assert storage_apps.users_paired_on_level?(12345, 123, 124, 67890)
  end

  def test_derive_project_type
    signedin_storage_id = @user_storage_ids_table.insert(user_id: 20)
    storage_apps = StorageApps.new(signedin_storage_id)

    # Create without type
    typeless = storage_apps.create({}, ip: 123)
    assert_equal 'unknown', storage_apps.project_type_from_channel_id(typeless)

    # Create with type argument
    type_in_column = storage_apps.create({}, ip: 123, type: 'applab')
    assert_equal 'applab', storage_apps.project_type_from_channel_id(type_in_column)

    # Create with type in value JSON blob
    type_in_json = storage_apps.create({projectType: 'gamelab'}, ip: 123)
    assert_equal 'gamelab', storage_apps.project_type_from_channel_id(type_in_json)

    # Create with type that can be derived from the level property in the JSON blob
    type_in_level = storage_apps.create({level: '/projects/weblab'}, ip: 123)
    assert_equal 'weblab', storage_apps.project_type_from_channel_id(type_in_level)
  end
end
