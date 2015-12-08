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
    wall_map
    block_moving_into_walls
    grid_aligned_movement
    item_grid_aligned_movement
    item_collisions
    remove_items_when_actor_collides
    slow_execution_factor
    marker_height
    marker_width
    delay_completion
    floating_score
    goal_override
    auto_arrow_steer
    tap_svg_to_run_and_reset
    msg_string_overrides
    music
    play_start_sound
    show_timeout_rect
    progress_conditions
  )

  def self.create_from_level_builder(params, level_params)
    level = new(level_params.merge(user: params[:user], game: Game.custom_studio, level_num: 'custom'))
    level.create_maze(level_params, params)
    level
  end

  # Attributes that are stored as JSON strings but should be passed through to the app as
  # actual JSON objects.  You can list attributes in snake_case here for consistency, but this method
  # returns camelCase properties because of where it's used in the pipeline.
  def self.json_object_attrs
    %w(
      progress_conditions
    ).map{ |x| x.camelize(:lower) }
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    ['studio', 'infinity', 'hoc2015', 'hoc2015x', 'gumball', 'iceage']
  end

  def self.default_progress_conditions
    <<-JS.strip_heredoc.chomp
        [
          // { "required": { "collectedSpecificItemsAtOrAbove": { "className": "mynock", "count": 8 } },
          //   "result": { "success": true, "messageKey": "successCharacter1" } },
          // { "required": {"timedOut": true, "collectedSpecificItemsAtOrAbove": { "className": "mynock", "count": 5 } },
          //   "result": { "success": false, "canPass": true, "messageKey": "failedChainCharactersTimeoutGotSome" } },
          // { "required": {
          //     "collectedSpecificItemsAtOrAbove": { "className": "tauntaun", "count": 4 },
          //     "createdSpecificItemsBelow": { "className": "mynock", "count": 5 }
          //   },
          //   "result": { "success": false, "messageKey": "failedChainCharactersTimeout" } },
          // { "required": { "timedOut": true },
          //   "result": { "success": false, "messageKey": "failedChainCharactersTimeout" } }
          //
          // All possible conditions:
          // timedOut, collectedItemsAtOrAbove/collectedItemsBelow, collectedSpecificItemsAtOrAbove/collectedSpecificItemsBelow
          // createdSpecificItemsAtOrAbove/createdSpecificItemsBelow, gotAllItems, touchedHazardsAtOrAbove
          // currentPointsAtOrAbove/currentPointsBelow, allGoalsVisited, setMap, setSprite, setDroidSpeed, throwProjectile, setEmotion
        ]
    JS
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

  def self.wall_map_options
    [
      ['Use custom map (default)', 'default'],
      ['Blank', 'blank'],
      ['Blobs (hoc2015 only)', 'blobs'],
      ['Horizontal (hoc2015 only)', 'horizontal'],
      ['Grid (hoc2015 only)', 'grid'],
      ['Circle (hoc2015 only)', 'circle']
    ]
  end

  def self.background_options
    [
      ['Hardcourt (studio only)', 'hardcourt'],
      ['Black (studio only)', 'black'],
      ['Cave (studio only)', 'cave'],
      ['Night (studio only)', 'night'],
      ['Cloudy (studio only)', 'cloudy'],
      ['Underwater (studio only)', 'underwater'],
      ['City (studio only)', 'city'],
      ['Desert (studio only)', 'desert'],
      ['Rainbow (studio only)', 'rainbow'],
      ['Soccer (studio only)', 'soccer'],
      ['Tennis (studio only)', 'tennis'],
      ['Winter (studio only)', 'winter'],
      ['Grid (studio only)', 'grid'],
      ['Space (studio, gumball only)', 'space'],
      ['Characters (gumball only)', 'characters'],
      ['Checkers (gumball only)', 'checkers'],
      ['Clouds (gumball only)', 'clouds'],
      ['Cornered (gumball only)', 'cornered'],
      ['Dots (gumball only)', 'dots'],
      ['Graffiti (gumball only)', 'graffiti'],
      ['Squares (gumball only)', 'squares'],
      ['Stripes (gumball only)', 'stripes'],
      ['Wood (gumball only)', 'wood'],
      ['Icy 1 (iceage only)', 'icy1'],
      ['Icy 2 (iceage only)', 'icy2'],
      ['Icy 3 (iceage only)', 'icy3'],
      ['Icy 4 (iceage only)', 'icy4'],
      ['Icy 5 (iceage only)', 'icy5'],
      ['Ground (iceage only)', 'ground'],
      ['Main (hoc2015x only)', 'main'],
      ['Hoth (hoc2015 only)', 'hoth'],
      ['Endor (hoc2015 only)', 'endor'],
      ['Starship (hoc2015 only)', 'starship'],
      ['Circle (hoc2015 only)', 'circle'],
      ['Leafy (infinity only)', 'leafy'],
      ['Grassy (infinity only)', 'grassy'],
      ['Flower (infinity only)', 'flower'],
      ['Tile (infinity only)', 'tile'],
      ['Icy (infinity only)', 'icy']
    ]
  end

  MusicTrack = Struct.new(:name, :value)
  def self.music_options
    [
      MusicTrack.new('Song1 (hoc2015, hoc2015x only)', 'song1'),
      MusicTrack.new('Song2 (hoc2015, hoc2015x only)', 'song2'),
      MusicTrack.new('Song3 (hoc2015, hoc2015x only)', 'song3'),
      MusicTrack.new('Song4 (hoc2015, hoc2015x only)', 'song4'),
      MusicTrack.new('Song5 (hoc2015, hoc2015x only)', 'song5'),
      MusicTrack.new('Song6 (hoc2015, hoc2015x only)', 'song6'),
      MusicTrack.new('Song7 (hoc2015, hoc2015x only)', 'song7'),
      MusicTrack.new('Song8 (hoc2015, hoc2015x only)', 'song8'),
      MusicTrack.new('Song9 (hoc2015, hoc2015x only)', 'song9'),
      MusicTrack.new('Song10 (hoc2015, hoc2015x only)', 'song10'),
      MusicTrack.new('Song11 (hoc2015, hoc2015x only)', 'song11'),
      MusicTrack.new('Song12 (hoc2015, hoc2015x only)', 'song12'),
      MusicTrack.new('Song13 (hoc2015, hoc2015x only)', 'song13'),
      MusicTrack.new('Song14 (hoc2015, hoc2015x only)', 'song14'),
      MusicTrack.new('Song15 (hoc2015, hoc2015x only)', 'song15'),
    ]
  end

  def assign_defaults_before_editing
    self.play_start_sound = true if self.play_start_sound.nil?
    super
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
  <block type="studio_whenUp" />
  <block type="studio_whenDown" />
  <block type="studio_whenLeft" />
  <block type="studio_whenRight" />
  <block type="studio_whenSpriteClicked" />
  <block type="studio_whenSpriteCollided" />
  <block type="studio_whenTouchCharacter" />
  <block type="studio_whenTouchObstacle" />
  <block type="studio_whenTouchGoal" />
  <block type="studio_whenGetCharacter" />
  <block type="studio_whenGetAllCharacters" />
  <block type="studio_whenGetAllCharacterClass" />
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
  <block type="studio_addPoints" />
  <block type="studio_removePoints" />
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
  <block type="studio_setDroidSpeed" />
  <block type="studio_setSpriteEmotion" />
  <block type="studio_setSpriteEmotionParams">
    <value name="SPRITE">
      <block type="math_number">
        <title name="NUM">1</title>
      </block>
    </value>
  </block>
  <block type="studio_showCoordinates" />
  <block type="studio_setMap" />
  <block type="studio_setSpriteSize" />
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
  <block type="studio_endGame" />
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
