require 'test_helper'

require_relative '../../../shared/middleware/helpers/storage_apps'

class ChannelTokenTest < ActiveSupport::TestCase
  setup_all do
    @level = create :level
    @user = create :user
    @fake_ip = '127.0.0.1'
    @storage_app = StorageApps.new storage_id('user')
  end

  test 'find_or_create_channel_token sets storage_id and storage_app_id' do
    channel_token = ChannelToken.find_or_create_channel_token(
      @level,
      @user,
      @fake_ip,
      @storage_app
    )

    storage_id, storage_app_id = storage_decrypt_channel_id(channel_token.channel)
    assert_equal storage_id, channel_token.storage_id
    assert_equal storage_app_id, channel_token.storage_app_id
  end
end
