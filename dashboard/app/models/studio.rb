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
    coordinate_grid_background
    free_play
  )

  def self.create_from_level_builder(params, level_params)
    level = new(level_params.merge(user: params[:user], game: Game.custom_studio, level_num: 'custom'))
    level.create_maze(level_params, params)
    level
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    ['studio']
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
  <block type="studio_setBackground" />
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
<category name="Functional">
  <block type="functional_setBackground" />
  <block type="functional_setPlayerSpeed" />
  <block type="functional_setEnemySpeed" />
  <block type="functional_showTitleScreen" />
  <block type="functional_string" />
  <block type="functional_background_string_picker" />
  <block type="functional_math_number" />
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
