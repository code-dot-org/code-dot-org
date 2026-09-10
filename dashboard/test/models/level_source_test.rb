require 'test_helper'

require 'digest/md5'

class LevelSourceTest < ActiveSupport::TestCase
  STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)

  setup_all do
    @user = create(:user)
    @level = create(:level)
    @level_source = create(:level_source, level_id: @level.id, data: 'data')
  end

  setup do
    # encrypt_level_source_id and decrypt_level_source_id both run in-process,
    # so any self-consistent key exercises the round trip.
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)
  end

  test 'should auto-compute md5 on save' do
    new_data = 'different data'
    @level_source.update!(data: new_data)
    @level_source.reload
    assert_equal Digest::MD5.hexdigest(new_data), @level_source.md5
  end

  test "should not create level source with utf8mb8" do
    program = "<xml>#{panda_panda}</xml>"
    level_source = LevelSource.find_identical_or_create(@level, program)
    refute level_source.valid?
    assert_equal ['Data is invalid'], level_source.errors.full_messages
  end

  test 'decrypt reverses encrypt for valid user' do
    encrypted = @level_source.encrypt_level_source_id(@user.id)
    decrypted = LevelSource.decrypt_level_source_id(encrypted)
    assert_equal @level_source.id, decrypted
  end

  test 'decrypt returns nil for non-valid user' do
    encrypted = @level_source.encrypt_level_source_id(User.last.id + 1)
    decrypted = LevelSource.decrypt_level_source_id(encrypted)
    assert_nil decrypted
  end

  test 'decrypt reverses encrypt for nil user' do
    encrypted = @level_source.encrypt_level_source_id(nil)
    decrypted = LevelSource.decrypt_level_source_id(encrypted)
    assert_equal @level_source.id, decrypted
  end

  test 'decrypt reverses encrypt always if ignore_missing_user is set' do
    encrypted = @level_source.encrypt_level_source_id(User.last.id + 1)
    decrypted = LevelSource.decrypt_level_source_id(encrypted, ignore_missing_user: true)
    assert_equal @level_source.id, decrypted
  end
end
