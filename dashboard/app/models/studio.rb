# == Schema Information
#
# Table name: levels
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)      not null
#  created_at               :datetime
#  updated_at               :datetime
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean          default(FALSE), not null
#  notes                    :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#

class Studio < Grid
  serialized_attrs %w(
    first_sprite_index
    protaganist_sprite_index
    success_condition
    failure_condition
    timeout_failure_tick
    soft_buttons
    edge_collisions
    projectile_collisions
    allow_sprites_outside_playspace
    sprites_hidden_to_start
    background
    coordinate_grid_background
    free_play
    disable_sharing
    timeout_after_when_run
    custom_game_type
    complete_on_success_condition_not_goals
    input_output_table
    code_functions
    sort_draw_order
    wall_map_collisions
    block_moving_into_walls
    grid_aligned_movement
    item_grid_aligned_movement
    remove_items_when_actor_collides
    slow_js_execution_factor
    marker_height
    marker_width
    delay_completion
    floating_score
    goal_override
  )

  def self.create_from_level_builder(params, level_params)
    level = new(level_params.merge(user: params[:user], game: Game.custom_studio, level_num: 'custom'))
    level.create_maze(level_params, params)
    level
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    %w(studio infinity hoc2015)
  end

  def self.default_success_condition
    <<-JS.strip_heredoc.chomp
        function () {
          // Sample conditions:
          // return Studio.sprite[0].isCollidingWith(1);
          // return Studio.sayComplete > 0;
          // return Studio.sprite[0].emotion === Emotions.HAPPY;
          // return Studio.tickCount > 50;
        }
    JS
  end

  def self.default_failure_condition
    <<-JS.strip_heredoc.chomp
        function () {
        }
    JS
  end

  def common_blocks(type)
    <<-XML.chomp
<category name="Start">
  <block type="when_run" />
</category>
<category name="Events">
  <block type="studio_whenArrow" />
  <block type="studio_whenSpriteClicked" />
  <block type="studio_whenSpriteCollided" />
</category>
<category name="Actions">
  <block type="studio_setSprite" />
  <block type="studio_setSpriteParams">
    <value name="SPRITE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="studio_setSpriteParamValue"/>
  <block type="studio_setBackground" />
  <block type="studio_setBackgroundParam" />
  <block type="studio_showTitleScreen">
    <title name="TITLE">type title here</title>
    <title name="TEXT">type text here</title>
  </block>
  <block type="studio_showTitleScreenParams">
    <value name="TITLE">
      <block type="text" />
    </value>
    <value name="TEXT">
      <block type="text" />
    </value>
  </block>
  <block type="studio_move" />
  <block type="studio_moveDistance">
    <title name="DIR">1</title>
    #{'<title name="DISTANCE">???</title>' if type == 'required_blocks'}
  </block>
  <block type="studio_moveDistanceParams" inline="true">
    <value name="DISTANCE">
      <block type="math_number">
        <title name="NUM">25</title>
      </block>
    </value>
  </block>
  <block type="studio_moveDistanceParamsSprite">
    <value name="SPRITE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
    <value name="DISTANCE">
      <block type="math_number">
        <title name="NUM">25</title>
      </block>
    </value>
  </block>
  <block type="studio_stop" />
  <block type="studio_stopSprite">
    <value name="SPRITE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="studio_wait">
    <title name="VALUE">500</title>
  </block>
  <block type="studio_waitParams" inline="true">
    <value name="VALUE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="studio_playSound" />
  <block type="studio_changeScore" />
  <block type="studio_setScoreText" inline="true">
    <value name="TEXT">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="studio_saySprite">
    <title name="TEXT">type here</title>
  </block>
  <block type="studio_saySpriteChoices" inline="true">
  </block>
  <block type="studio_saySpriteParams" inline="true">
    <value name="TEXT">
      <block type="text" />
    </value>
  </block>
  <block type="studio_saySpriteParamsTime" inline="true">
    <value name="SPRITE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
    <value name="TEXT">
      <block type="text" />
    </value>
    <value name="TIME">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="studio_setSpritePosition" />
  <block type="studio_addGoal" />
  <block type="studio_addGoalXY" />
  <block type="studio_setSpriteXY" inline="true">
    <value name="XPOS">
      <block type="math_number">
        <title name="NUM">200</title>
      </block>
    </value>
    <value name="YPOS">
      <block type="math_number">
        <title name="NUM">200</title>
      </block>
    </value>
  </block>
  <block type="studio_throw" />
  <block type="studio_makeProjectile" />
  <block type="studio_setSpriteSpeed" />
  <block type="studio_setSpriteSpeedParams">
    <value name="SPRITE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
    <value name="VALUE">
      <block type="math_number">
        <title name="NUM">5</title>
      </block>
    </value>
  </block>
  <block type="studio_setSpriteEmotion" />
  <block type="studio_setSpriteEmotionParams">
    <value name="SPRITE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="studio_setSpriteSize" />
  <block type="studio_showCoordinates" />
  <block type="studio_setSpriteSizeParams">
    <value name="SPRITE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
    <value name="VALUE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="studio_vanish" />
  <block type="studio_vanishSprite">
    <value name="SPRITE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
</category>
<category name="Loops">
  <block type="studio_repeatForever" />
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
<category name="Logic">
  <block type="controls_if" />
  <block type="logic_compare" />
  <block type="logic_operation" />
  <block type="logic_negate" />
  <block type="logic_boolean" />
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
<category name="Text">
  <block type="text" />
  <block type="text_join" />
  <block type="text_append">
    <value name="TEXT">
      <block type="text" />
    </value>
  </block>
</category>
<category name="Variables" custom="VARIABLE" />
<category name="Functions" custom="PROCEDURE" />
<category name="Functional variables" custom="FUNCTIONAL_VARIABLE" />
<category name="Functional Start">
  <block type="functional_start_setFuncs" />
  <block type="functional_start_setVars" />
  <block type="functional_start_setValue" />
  <block type="functional_start_setBackground" />
  <block type="functional_start_setSpeeds" />
  <block type="functional_start_setBackgroundAndSpeeds" />
  <block type="functional_start_dummyOnMove" />
</category>
<category name="Functional String">
  <block type="functional_string" />
  <block type="functional_background_string_picker" />
</category>
<category name="Functional Number">
  <block type="functional_plus"></block>
  <block type="functional_minus"></block>
  <block type="functional_times"></block>
  <block type="functional_dividedby"></block>
  <block type="functional_math_number" />
  <block type="functional_math_number_dropdown">
    <title name="NUM" config="2,3,4,5,6,7,8,9,10,11,12">???</title>
  </block>
  <block type="functional_sqrt"></block>
  <block type="functional_squared"></block>
  <block type="functional_pow"></block>
</category>
<category name="Functional Boolean">
  <block type="functional_greater_than" />
  <block type="functional_less_than" />
  <block type="functional_number_equals" />
  <block type="functional_string_equals" />
  <block type="functional_logical_and" />
  <block type="functional_logical_or" />
  <block type="functional_logical_not" />
  <block type="functional_boolean" />
  <block type="functional_keydown" />
</category>
<category name ="Functional Image">
  <block type="functional_sprite_dropdown" />
  <block type="functional_background_dropdown" />
</category>
<category name ="Functional Cond">
  <block type="functional_cond_number" />
  <block type="functional_cond_string" />
  <block type="functional_cond_image" />
  <block type="functional_cond_boolean" />
</category>

#{k1_blocks(type) if is_k1 == 'true'}
    XML
  end

  # Other K1 blocks are just variants of common_blocks, but display differently when is_k1 is set
  def k1_blocks(type)
    <<-XML.chomp
<category name="K1-only Blocks">
  <block type="studio_moveNorthDistance"></block>
  <block type="studio_moveEastDistance"></block>
  <block type="studio_moveSouthDistance"></block>
  <block type="studio_moveWestDistance"></block>
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
end
