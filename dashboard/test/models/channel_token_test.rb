require 'test_helper'

require_relative '../../../shared/middleware/helpers/storage_apps'

class ChannelTokenTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @script = create :script
    @level = create :level
    create :script_level, script: @script, levels: [@level]
    @fake_ip = '127.0.0.1'
    @storage_id = fake_storage_id_for_user_id(nil)
  end

  test 'find_or_create_channel_token sets storage_id and storage_app_id' do
    channel_token = ChannelToken.find_or_create_channel_token(
      @level,
      @fake_ip,
      @storage_id,
      @script.id
    )

    storage_id, storage_app_id = storage_decrypt_channel_id(channel_token.channel)
    assert_equal storage_id, channel_token.storage_id
    assert_equal storage_app_id, channel_token.storage_app_id
  end

  test 'find_or_create_channel_token returns the channel_token if one exists' do
    level = create :level
    expected_channel_token = create :channel_token, level: level, storage_id: @storage_id

    channel_token = ChannelToken.find_or_create_channel_token(
      level,
      @fake_ip,
      @storage_id,
      @script.id
    )

    assert_equal expected_channel_token.id, channel_token.id
  end

  test 'find_or_create_channel_token returns a channel_token for the script_id if one exists' do
    create :channel_token, level: @level, storage_id: @storage_id, script_id: nil
    expected_channel_token = create :channel_token, level: @level, storage_id: @storage_id, script_id: @script.id

    channel_token = ChannelToken.find_or_create_channel_token(
      @level,
      @fake_ip,
      @storage_id,
      @script.id
    )

    assert_equal expected_channel_token.id, channel_token.id
  end

  test 'find_or_create_channel_token will create a new channel token with script_id if no channel token exists' do
    level = create :level
    channel_token = ChannelToken.find_or_create_channel_token(
      level,
      @fake_ip,
      @storage_id,
      @script.id
    )

    assert_equal channel_token.script_id, @script.id
  end
end
