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

  test 'find_by_c_link should find for integer' do
    assert_equal @level_source, LevelSource.find_by_c_link(@level_source.id)
  end

  test 'find_by_c_link should find for unobfuscated id' do
    assert_equal @level_source, LevelSource.find_by_c_link(@level_source.id.to_s)
  end

  test 'find_by_c_link should return nil for unobfuscated bad id' do
    assert_nil LevelSource.find_by_c_link((LevelSource.last.id + 1).to_s)
  end

  test 'find_by_c_link should find for obfuscated id' do
    obfuscated_id = @level_source.c_link_from_user_id @user.id
    assert_equal @level_source, LevelSource.find_by_c_link(obfuscated_id)
  end

  test 'find_by_c_link should return nil for obfuscated bad or deleted user id' do
    user = create :user
    user.destroy!
    [User.last.id + 1, user.id].each do |user_id|
      obfuscated_id = @level_source.c_link_from_user_id user_id.to_s
      assert_nil LevelSource.find_by_c_link(obfuscated_id)
    end
  end

  test 'find_by_c_link should respect verify_user for deleted user_id' do
    user = create :user
    user.destroy!
    obfuscated_id = @level_source.c_link_from_user_id user.id.to_s

    assert_equal @level_source, LevelSource.find_by_c_link(obfuscated_id, verify_user: false)
    assert_nil LevelSource.find_by_c_link(obfuscated_id, verify_user: true)
  end

  test 'c_link_from_user_id should return level_source_id if no user_id' do
    c_link = @level_source.c_link_from_user_id nil
    assert_equal @level_source.id.to_s, c_link
  end

  test 'c_link_from_user_id should return obfuscated id if user_id' do
    c_link = @level_source.c_link_from_user_id @user.id
    refute_equal @level_source.id.to_s, c_link
  end

  test 'c_link_from_user_id should return level_source' do
    [nil, @user.id].each do |user_id|
      c_link = @level_source.c_link_from_user_id user_id
      assert_equal @level_source, LevelSource.find_by_c_link(c_link)
    end
  end
end
