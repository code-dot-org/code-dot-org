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
#  ideal_level_source_id :integer
#  user_id               :integer
#  properties            :text(65535)
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
    helper_libraries
    custom_helper_library
    custom_blocks
    hide_custom_blocks
    use_default_sprites
  )

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.gamelab,
        level_num: 'custom',
        properties: {
          show_debug_watch: true,
          helper_libraries: [
            "GameLabJr",
          ],
          use_default_sprites: true,
          hide_animation_mode: true,
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
<category name="World">
  <block type="gamelab_setBackground">
    <value name="COLOR">
      <block type="colour_picker"></block>
    </value>
  </block>
  <block type="gamelab_showTitleScreen" />
  <block type="gamelab_hideTitleScreen" />
</category>
<category name="Sprites">
  <block type="gamelab_makeNewSprite" />
  <block type="gamelab_setAnimation" />
  <block type="gamelab_setTint">
    <value name="COLOR">
      <block type="colour_picker"></block>
    </value>
  </block>
  <block type="gamelab_removeTint" />
  <block type="gamelab_moveUp" />
  <block type="gamelab_moveDown" />
  <block type="gamelab_moveLeft" />
  <block type="gamelab_moveRight" />
  <block type="gamelab_setPosition" />
  <block type="gamelab_displace" />
  <block type="gamelab_destroy" />
  <block type="gamelab_firstTouched" />
  <block type="gamelab_secondTouched" />
  <block type="sprite_variables_get" />
  <block type="sprite_variables_set" />
</category>
<category name="Groups">
  <block type="gamelab_makeNewGroup" />
  <block type="gamelab_add" />
  <block type="gamelab_groupLength" />
</category>
<category name="Events">
  <block type="gamelab_whenUpArrow" />
  <block type="gamelab_whenDownArrow" />
  <block type="gamelab_whenLeftArrow" />
  <block type="gamelab_whenRightArrow" />
  <block type="gamelab_whileUpArrow" />
  <block type="gamelab_whileDownArrow" />
  <block type="gamelab_whileLeftArrow" />
  <block type="gamelab_whileRightArrow" />
  <block type="gamelab_whenTouching" />
  <block type="gamelab_whileTouching" />
  <block type="gamelab_clickedOn" />
</category>
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
    XML
  end

  def toolbox(type)
    return common_blocks(type) unless type == 'toolbox_blocks'
    <<-XML.chomp
<category name="Category">
  <block type="category"></block>
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
