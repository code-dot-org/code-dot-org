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
end
