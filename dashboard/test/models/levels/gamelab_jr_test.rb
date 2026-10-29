require 'test_helper'

class GamelabJrTest < ActiveSupport::TestCase
  def toolbox(*types)
    {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Platform',
          contents: types.map {|type| {kind: 'block', type: type, inputs: {SPRITE: {shadow: {type: 'gamelab_allSpritesWithAnimation'}}}}}
        }
      ]
    }.to_json
  end

  test 'offered block types are the toolbox blocks, not their shadows or categories' do
    level = create(:spritelab, properties: {'toolbox_definition' => toolbox('gamelab_spriteSay', 'spritelab2_burst')})
    assert_equal %w(gamelab_spriteSay spritelab2_burst), level.offered_block_types
  end

  test 'blocks add_blocks places count as offered, their placeholders do not' do
    add_blocks = [
      {type: 'gamelab_atTime', next: {shadow: {type: 'spritelab2_placeholder', extraState: {like: {type: 'gamelab_spriteSay'}}}}}
    ].to_json
    level = create(:spritelab, properties: {'toolbox_definition' => toolbox('spritelab2_burst'), 'add_blocks' => add_blocks})
    assert_equal %w(spritelab2_burst gamelab_atTime), level.offered_block_types
  end

  test 'a field or extra state carrying a type is not an offered block' do
    toolbox = {
      kind: 'categoryToolbox',
      contents: [{kind: 'category', name: 'Platform', contents: [
        {kind: 'block', type: 'gamelab_setProp', fields: {VAR: {id: 'v1', name: 'score', type: ''}}},
        {kind: 'block', type: 'spritelab2_placeholder', extraState: {like: {type: 'gamelab_spriteSay'}}},
      ]}]
    }.to_json
    level = create(:spritelab, properties: {'toolbox_definition' => toolbox})
    assert_equal %w(gamelab_setProp spritelab2_placeholder), level.offered_block_types
  end

  test 'a level with no toolbox offers nothing' do
    level = create(:spritelab)
    assert_equal [], level.offered_block_types
  end

  test 'new block types are those no earlier level of the unit offered' do
    script = create(:script, :in_single_unit_course)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, lesson_group: lesson_group, script: script)
    first = create(:spritelab, properties: {'toolbox_definition' => toolbox('gamelab_spriteSay')})
    second = create(:spritelab, properties: {'toolbox_definition' => toolbox('spritelab2_burst')})
    last = create(:spritelab, properties: {'toolbox_definition' => toolbox('gamelab_spriteSay', 'spritelab2_burst', 'spritelab2_setWeather')})
    create(:script_level, script: script, lesson: lesson, levels: [first], chapter: 1, position: 1)
    create(:script_level, script: script, lesson: lesson, levels: [second], chapter: 2, position: 2)
    last_sl = create(:script_level, script: script, lesson: lesson, levels: [last], chapter: 3, position: 3)
    script.reload

    assert_equal %w(spritelab2_setWeather), last.new_block_types(script, last_sl)
    assert_equal %w(spritelab2_setWeather), last.summarize_for_lab2_properties(script, last_sl)[:newBlocks]
  end
end
