require 'test_helper'

class GamelabJrTest < ActiveSupport::TestCase
  test 'a level saved with a level_config drops the properties it replaces' do
    level = create(:spritelab, level_mode: {'kind' => 'code'}, world_keeps_roles: ['hero'], uses_lab2: true)
    level.level_config = {'world' => {}}
    level.save!
    level.reload

    assert_equal({'world' => {}}, level.level_config)
    assert_nil level.properties['level_mode']
    assert_nil level.properties['world_keeps_roles']
    assert_equal 'true', level.uses_lab2.to_s
  end

  test 'a level without a level_config keeps its properties' do
    level = create(:spritelab, level_mode: {'kind' => 'code'})
    level.save!

    assert_equal({'kind' => 'code'}, level.reload.properties['level_mode'])
  end

  test 'a level with noProject in its level_config has no project' do
    level = create(:spritelab, uses_lab2: true, level_config: {'focus' => 'play', 'edits' => [], 'noProject' => true})
    refute level.channel_backed?
    level.level_config = {'focus' => 'play', 'edits' => []}
    level.project_template_level_name = 'some-template'
    assert level.channel_backed?
  end
end
