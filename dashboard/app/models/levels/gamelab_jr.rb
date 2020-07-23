# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :integer          unsigned
#  user_id               :integer
#  properties            :text(16777215)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

class GamelabJr < Gamelab
  serialized_attrs %w(
    custom_helper_library
    custom_blocks
    hide_custom_blocks
    use_default_sprites
    block_pools
    mini_toolbox
  )

  def shared_blocks
    Block.for(*block_pools.presence || type)
  end

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.spritelab,
        level_num: 'custom',
        properties: {
          show_debug_watch: true,
          block_pools: [
            "GamelabJr",
          ],
          helper_libraries: [
            "NativeSpriteLab",
          ],
          use_default_sprites: true,
          hide_animation_mode: true,
          show_type_hints: true,
          hide_custom_blocks: true,
          all_animations_single_frame: true,
          use_modal_function_editor: true,
          mini_toolbox: false
        }
      )
    )
  end

  def common_blocks(type)
    <<-XML.chomp
<category name="Start">
  <block type="when_run" />
</category>
<category name="Variables" custom="VARIABLE" />
<category name="Functions" custom="PROCEDURE" />
<category name="World" />
<category name="Sprites" custom="Sprite" />
<category name="Groups" />
<category name="Events" />
<category name="Math">
  <block type="math_number" />
  <block type="math_change">
    <value name="DELTA">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="math_random_int">
    <value name="FROM">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
    <value name="TO">
      <block type="math_number">
        <title name="NUM">100</title>
      </block>
    </value>
  </block>
  <block type="math_arithmetic" />
</category>
<category name="Logic">
  <block type="controls_if" />
  <block type="logic_compare" />
  <block type="logic_operation" />
  <block type="logic_negate" />
  <block type="logic_boolean" />
</category>
<category name="Loops">
  <block type="controls_repeat_ext">
    <value name="TIMES">
      <block type="math_number">
        <title name="NUM">10</title>
      </block>
    </value>
  </block>
  <block type="controls_whileUntil" />
  <block type="controls_for">
    <value name="FROM">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
    <value name="TO">
      <block type="math_number">
        <title name="NUM">10</title>
      </block>
    </value>
    <value name="BY">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="controls_flow_statements" />
</category>
<category name="Text">
  <block type="text_join_simple" inputcount="2" />
  <block type="text" />
</category>
<category name="Behaviors" custom="Behavior" />
    XML
  end

  def toolbox(type)
    return common_blocks(type) unless type == 'toolbox_blocks'
    <<-XML.chomp
<category name="Category">
  <block type="category"></block>
  <block type="custom_category"></block>
</category>
#{common_blocks(type)}
    XML
  end

  def default_toolbox_blocks
    complete_toolbox 'default_blocks'
  end

  # These serialized fields will be serialized/deserialized as straight XML
  def xml_blocks
    %w(initialization_blocks start_blocks toolbox_blocks required_blocks recommended_blocks solution_blocks)
  end

  def uses_droplet?
    false
  end

  def age_13_required?
    false
  end
end
