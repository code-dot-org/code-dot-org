require 'test_helper'

require 'digest/md5'

class LevelSourceTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @level = create :level
    @level_source = create(:level_source, level_id: @level.id, data: 'data')
    @user = create :user
  end

  test 'should auto-compute md5 on save' do
    new_data = 'different data'
    @level_source.update!(data: new_data)
    @level_source.reload
    assert_equal Digest::MD5.hexdigest(new_data), @level_source.md5
  end

  test 'c_link_from_level_source_id should raise if no user_id' do
    assert_raises do
      @level_source.c_link_from_user_id user_id
    end
  end

  test 'level_source_id_from_c_link recovers level_source_id' do
    c_link = @level_source.c_link_from_user_id @user.id
    level_source_id = LevelSource.level_source_id_from_c_link c_link, verify_user: false
    assert_equal @level_source.id, level_source_id
  end

  test 'level_source_id_from_c_link bypasses user if verify_user is false' do
    bad_user_id = -1
    c_link = @level_source.c_link_from_user_id bad_user_id
    level_source_id = LevelSource.level_source_id_from_c_link c_link, verify_user: false
    assert_equal @level_source.id, level_source_id
  end

  test 'level_source_id_from_c_link returns nil if verify_user fails' do
    bad_user_id = -1
    c_link = @level_source.c_link_from_user_id bad_user_id
    level_source_id = LevelSource.level_source_id_from_c_link c_link, verify_user: true
    assert_nil level_source_id
  end

  test 'level_source_id_from_c_link returns nil if verify_user succeeds' do
    c_link = @level_source.c_link_from_user_id @user.id
    level_source_id = LevelSource.level_source_id_from_c_link c_link, verify_user: true
    assert_equal @level_source.id, level_source_id
  end

  test 'level_source_id_from_c_link returns nil for malformed c_link' do
    assert_nil LevelSource.level_source_id_from_c_link 'malformed c link', verify_user: false
  end

  test "should not create level source with utf8mb8" do
    program = "<xml>#{panda_panda}</xml>"
    level_source = LevelSource.find_identical_or_create(@level, program)
    refute level_source.valid?
    assert_equal ['Data is invalid'], level_source.errors.full_messages
  end
end
