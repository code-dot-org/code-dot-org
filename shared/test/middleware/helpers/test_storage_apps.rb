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
end
