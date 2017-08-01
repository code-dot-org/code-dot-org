require 'test_helper'

require 'digest/md5'

class LevelSourceTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @level = create :level
    @level_source = create(:level_source, level_id: @level.id, data: 'data')
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

  test "encrypt is the reverse of decrypt for valid user and level" do
    user = create :user
    encpryted = @level_source.encrypt_level_source_id(user.id)
    decrypted = LevelSource.decrypt_level_source_id(encpryted)
    assert_equal @level_source.id, decrypted
  end

  test "encrypt is the reverse of decrypt for non-valid user and level" do
    encpryted = @level_source.encrypt_level_source_id(User.last.id + 1)
    decrypted = LevelSource.decrypt_level_source_id(encpryted)
    assert_nil decrypted
  end

  test "encrypt is the reverse of decrypt for nil user and level" do
    encpryted = @level_source.encrypt_level_source_id(nil)
    decrypted = LevelSource.decrypt_level_source_id(encpryted)
    assert_nil decrypted
  end
end
