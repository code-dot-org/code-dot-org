require 'test_helper'

require_relative '../../../shared/middleware/helpers/storage_apps'

class ChannelTokenTest < ActiveSupport::TestCase
  setup_all do
    @level = create :level
    @user = create :user
    @fake_ip = '127.0.0.1'

    # As StorageApps would introduce a dependency on the pegasus DB, we stub it here.
    rng = Random.new 0
    StorageApps.stubs(:new).
      returns(stub(create: storage_encrypt_channel_id(rng.rand(1_000), rng.rand(1_000))))
  end

  test 'find_or_create_channel_token sets storage_app_id' do
    channel_token = ChannelToken.find_or_create_channel_token(
      @level,
      @user,
      @fake_ip,
      StorageApps.new(0)
    )

    assert_equal(
      (storage_decrypt_channel_id channel_token.channel).second.to_i,
      channel_token.storage_app_id
    )
  end
end
