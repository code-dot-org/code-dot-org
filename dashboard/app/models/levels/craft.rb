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

require "csv"

class Craft < Blockly
  def shared_blocks
    Block.for('craft') if JSONValue.value(is_aquatic_level)
  end

  serialized_attrs(
    :ground_plane,
    :ground_decoration_plane,
    :action_plane,
    :entities,
    :player_start_position,
    :agent_start_position,
    :available_blocks,
    :drop_dropdown_options,
    :play_sound_options,
    :if_block_options,
    :place_block_options,
    :player_start_direction,
    :agent_start_direction,
    :verification_function,
    :failure_check_function,
    :timeout_verification_function,
    :show_popup_on_load,
    :is_daytime,
    :use_score,
    :is_event_level,
    :is_agent_level,
    :is_aquatic_level,
    :is_connection_level,
    :special_level_type,
    :grid_width,
    :grid_height,
    :day_night_cycle_start,
    :day_night_cycle_time,
    :level_verification_timeout,
    :use_player,
    :free_play,
    :ocean,
    :boat,
    :songs
  )

  JSON_LEVEL_MAPS = [
    :ground_plane,
    :ground_decoration_plane,
    :action_plane
  ].freeze

  EMPTY_STRING = ''.freeze
  DEFAULT_MAP_VALUE = EMPTY_STRING.freeze # no item

  ALL_BLOCKS = {
    EMPTY_STRING => true,

    # Regular Blocks
    bedrock: true,
    bricks: true,
    cactus: true,
    clay: true,
    terracotta: true,
    cobblestone: true,
    deadBush: true,
    dirt: true,
    dirtCoarse: true,
    doorIron: true,
    farmlandWet: true,
    glass: true,
    glowstone: true,
    grass: true,
    grassPath: true,
    gravel: true,
    ice: true,
    lava: true,
    netherBrick: true,
    netherrack: true,
    oreCoal: true,
    oreDiamond: true,
    oreEmerald: true,
    oreGold: true,
    oreIron: true,
    oreLapis: true,
    oreRedstone: true,
    pistonDown: true,
    pistonLeft: true,
    pistonRight: true,
    pistonUp: true,
    pressurePlateUp: true,
    quartzOre: true,
    rails: true,
    railsRedstoneTorch: true,
    redstoneWire: true,
    sand: true,
    sandstone: true,
    snow: true,
    snowyGrass: true,
    stone: true,
    tnt: true,
    topSnow: true,
    water: true,
    wool: true,
    wool_orange: true,
    wool_blue: true,
    wool_magenta: true,
    wool_pink: true,
    wool_red: true,
    wool_yellow: true,

    # House parts
    houseTopA: true,
    houseRightC: true,
    houseRightB: true,
    houseLeftA: true,
    houseRightA: true,
    houseBottomA: true,
    houseBottomB: true,
    houseBottomC: true,
    houseBottomD: true,

    # Tree parts
    logAcacia: true,
    logBirch: true,
    logJungle: true,
    logOak: true,
    logSpruce: true,
    planksAcacia: true,
    planksBirch: true,
    planksJungle: true,
    planksOak: true,
    planksSpruce: true,

    # Aquatic
    strippedOak: true,
    strippedDarkOak: true,
    stoneBricks: true,
    mossyStoneBricks: true,
    crackedStoneBricks: true,
    magmaBlock: true,
    blueCoralBlock: true,
    pinkCoralBlock: true,
    magentaCoralBlock: true,
    redCoralBlock: true,
    yellowCoralBlock: true,
    deadCoralBlock: true,
    blueDeadCoralBlock: true,
    pinkDeadCoralBlock: true,
    magentaDeadCoralBlock: true,
    readDeadCoralBlock: true,
    yellowDeadCoralBlock: true,
    prismarine: true,
    darkPrismarine: true,
    seaLantern: true,
    packedIce: true,
    blueIce: true,
    blackConcrete: true,
    seaGrass: true,
    kelp: true,
    polishedGranite: true,
    coralFanBlueBottom: true,
    coralFanPinkBottom: true,
    coralFanMagentaBottom: true,
    coralFanRedBottom: true,
    coralFanYellowFanBottom: true,
    coralFanBlueTop: true,
    coralFanPinkTop: true,
    coralFanMagentaTop: true,
    coralFanRedTop: true,
    coralFanYellowFanTop: true,
    coralFanBlueLeft: true,
    coralFanPinkLeft: true,
    coralFanMagentaLeft: true,
    coralFanRedLeft: true,
    coralFanYellowFanLeft: true,
    coralFanBlueRight: true,
    coralFanPinkRight: true,
    coralFanMagentaRight: true,
    coralFanRedRight: true,
    coralFanYellowFanRight: true,
    seaPickles: true,
    coralPlantBlue: true,
    coralPlantBlueDeep: true,
    coralPlantPink: true,
    coralPlantPinkDeep: true,
    coralPlantMagenta: true,
    coralPlantMagentaDeep: true,
    coralPlantRed: true,
    coralPlantRedDeep: true,
    coralPlantYellow: true,
    coralPlantYellowDeep: true,
    chest: true,
  }.freeze

  ALL_MINIBLOCKS = {
    dirt: true,
    dirtCoarse: true,
    sand: true,
    gravel: true,
    bricks: true,
    logAcacia: true,
    logBirch: true,
    logJungle: true,
    logOak: true,
    logSpruce: true,
    planksAcacia: true,
    planksBirch: true,
    planksJungle: true,
    planksOak: true,
    planksSpruce: true,
    cobblestone: true,
    sandstone: true,
    wool: true,
    redstoneDust: true,
    lapisLazuli: true,
    ingotIron: true,
    ingotGold: true,
    emerald: true,
    diamond: true,
    coal: true,
    bucketWater: true,
    bucketLava: true,
    gunPowder: true,
    wheat: true,
    potato: true,
    carrots: true,
    milk: true,
    egg: true,
    poppy: true
  }.freeze

  ALL_SOUNDS = {
    dirt: true,
    dirtCoarse: true,
    sand: true,
    gravel: true,
    bricks: true,
    logAcacia: true,
    logBirch: true,
    logJungle: true,
    logOak: true,
    logSpruce: true,
    planksAcacia: true,
    planksBirch: true,
    planksJungle: true,
    planksOak: true,
    planksSpruce: true,
    cobblestone: true,
    sandstone: true,
    wool: true,
    redstoneDust: true,
    lapisLazuli: true,
    ingotIron: true,
    ingotGold: true,
    emerald: true,
    diamond: true,
    coal: true,
    bucketWater: true,
    bucketLava: true,
    gunPowder: true,
    wheat: true,
    potato: true,
    carrots: true,
    milk: true,
    egg: true,
    poppy: true,
    sheep: true,
    sheepBaa: true,
    chickenHurt: true,
    chickenBawk: true,
    cowHuff: true,
    cowHurt: true,
    cowMoo: true,
    cowMooLong: true,
    creeperHiss: true,
    ironGolemHit: true,
    metalWhack: true,
    zombieBrains: true,
    zombieGroan: true,
    zombieHurt: true,
    zombieHurt2: true,
  }.freeze

  KNOWN_TILE_TYPES = {
    ground_plane: ALL_BLOCKS,
    ground_decoration_plane: {
      EMPTY_STRING => true,
      tallGrass: true,
      lavaPop: true,
      flowerDandelion: true,
      flowerOxeeye: true,
      flowerRose: true,
      torch: true
    },
    action_plane: ALL_BLOCKS.merge(
      {
        diamondMiniblock: true,
        creeper: true,
        sheep: true,
        cropWheat: true,
        treeAcacia: true,
        treeBirch: true,
        treeJungle: true,
        treeOak: true,
        treeSpruce: true
        # TODO(bjordan): rename & enable available subset once finished
        # rails_bottomLeft: true,
        # rails_bottomRight: true,
        # rails_horizontal: true,
        # rails_topLeft: true,
        # rails_topRight: true,
        # rails_unpoweredHorizontal: true,
        # rails_unpoweredVertical: true,
        # rails_vertical: true,
        # rails_poweredHorizontal: true,
        # rails_poweredVertical: true,
        # rails_redstoneTorch: true
      }
    )
  }.freeze

  TILES_TO_PREVIEW_IMAGES = {
    grass: '/blockly/media/skins/craft/images/Block_0000_Grass.png',
    logOak: '/blockly/media/skins/craft/images/Block_0008_log_oak.png',
    coarseDirt: '/blockly/media/skins/craft/images/Block_0002_coarse_dirt.png',
    leavesOak: '/blockly/media/skins/craft/images/Block_0014_leaves_oak.png',
    tallGrass: '/blockly/media/skins/craft/images/TallGrass.png',
    sheep: '/blockly/media/skins/craft/images/Sheep.png',
    treeOak: '/blockly/media/skins/craft/images/Leaves_Oak_Decay.png',
  }.freeze

  SAMPLE_TIMEOUT_VERIFICATION_FUNCTIONS = {
    fail:
'function (verificationAPI) {
  // Fail if we hit the end of the timeout.
  return false;
}',
    turnRandomCount:
'function(verificationAPI) {
  return verificationAPI.getTurnRandomCount() >= 1;
},',
    playerSurvived:
'function(verificationAPI) {
  // if we have reached the timeout without fail, they succeeded.
  return true;
},',

  }.freeze

  SAMPLE_EARLY_FAILURE_CHECK_FUNCTIONS = {
    neverFailEarly:
'function (verificationAPI) {
  // Fail instantly
  return false;
}',
    failInstantly:
'function (verificationAPI) {
  // Fail instantly
  return true;
}',
    turnRandomCount:
'function(verificationAPI) {
  // Fail instantly when they turn once.
  return verificationAPI.getTurnRandomCount() >= 1;
},',
  }.freeze

  SAMPLE_VERIFICATION_FUNCTIONS = {
    mapMatches:
'function (verificationAPI) {
      // the map has the given block layout.
      // "" means ignore, "empty" means nothing there, "any" means something there
      return verificationAPI.solutionMapMatchesResultMap(
            [
              "", "", "", "", "", "", "", "", "", "",
              "", "", "", "", "", "", "", "", "", "",
              "", "", "", "", "", "", "", "", "", "",
              "", "", "", "logOak", "logOak", "logOak", "logOak", "", "", "",
              "", "", "", "logOak", "empty", "empty", "logOak", "", "", "",
              "", "", "", "logOak", "empty", "empty", "logOak", "", "", "",
              "", "", "", "logOak", "any", "any", "any", "", "", "",
              "", "", "", "", "", "", "", "", "", "",
              "", "", "", "", "", "", "", "", "", "",
              "", "", "", "", "", "", "", "", "", ""
            ]);
}',

    countOfTypeOnMap:
'function (verificationAPI) {
      // there are at least 3 logOak blocks on the board
      return verificationAPI.countOfTypeOnMap("logOak") >= 3;
}',

    isPlayerAt:
'function (verificationAPI) {
      // player is at given x, y position
      return verificationAPI.isPlayerAt([5, 5]);
}',

    isPlayerNextTo:
'function (verificationAPI) {
      // player is next to block of type logOak
      return verificationAPI.isPlayerNextTo("logOak");
}',

    getInventoryAmount:
'function (verificationAPI) {
      // the player has collected at least 2 wool
      return verificationAPI.getInventoryAmount("wool") >= 2;
}',
    isEntityAt:
'function (verificationAPI) {
  // [5, 5]: grid coordinates, 0, 0 is top left
  verificationAPI.isEntityAt("sheep", [5, 5]);
}
',
    sheepOnGrassCount:
'function (verificationAPI) {
  var grassPositions = [[0, 0], [1, 1]]
  Var sheepOnGrassCount = 0;
  for(var i = 0 ; i < grassPositions.length ; i++ ) {
    if(verificationAPI.isEntityAt("sheep", grassPositions[i]))
      sheepOnGrassCount++;
    }
  return sheepOnGrassCount >= 2;
}
',
    isEntityDied:
'function (verificationAPI) {
  // replace 3 with number of zombies in map
  verificationAPI.isEntityDied("zombie", 3);
}
',
    playerAtOneOfManyPositions:
'function (verificationAPI) {
  // List of x, y positions.
  var successPositions = [[0, 0], [0, 1], [0, 2]];
  for (var i = 0; i < successPositions.length; i++) {
    if (verificationAPI.isEntityAt("Player", successPositions[i])) {
      return true;
    }
  }
}
'

  }.freeze

  def self.start_directions
    [['North', 0], ['East', 1], ['South', 2], ['West', 3]]
  end

  def self.song_options
    %w(
      vignette1
      vignette2-quiet
      vignette3
      vignette4-intro
      vignette5-shortpiano
      vignette7-funky-chirps-short
      vignette8-free-play
      nether2
    )
  end

  def self.show_popup_options
    [['Player Select Popup', 'playerSelection'],
     ['House Layout Select Popup', 'houseLayoutSelection']]
  end

  def self.special_level_type_options
    [
      ['House wall build level', 'houseWallBuild'],
      ['House building level', 'houseBuild'],
      ['Free play level', 'freeplay'],
      ['Minecart level', 'minecart'],
      ['Spawn Agent on success level', 'agentSpawn']
    ]
  end

  def get_width
    grid_width || 10
  end

  def get_height
    grid_height || 10
  end

  def self.create_from_level_builder(params, level_params)
    default_game_params = {}
    default_game_params[:ground_plane] = '[' + ([(['"grass"'] * 12).join(',')] * 12).join(",\n") + ']'
    default_game_params[:ground_decoration_plane] = '[' + ([(['""'] * 12).join(',')] * 12).join(",\n") + ']'
    default_game_params[:action_plane] = '[' + ([(['""'] * 12).join(',')] * 12).join(",\n") + ']'
    default_game_params[:player_start_position] = '[4, 4]'
    default_game_params[:grid_width] = '12'
    default_game_params[:grid_height] = '12'
    default_game_params[:player_start_direction] = 1
    default_game_params[:is_daytime] = true
    default_game_params[:is_aquatic_level] = true
    default_game_params[:use_player] = true
    default_game_params[:use_score] = false

    default_game_params[:verification_function] = SAMPLE_VERIFICATION_FUNCTIONS[:isPlayerNextTo]
    default_game_params[:timeout_verification_function] = SAMPLE_TIMEOUT_VERIFICATION_FUNCTIONS[:fail]
    default_game_params[:failure_check_function] = SAMPLE_EARLY_FAILURE_CHECK_FUNCTIONS[:neverFailEarly]
    default_game_params[:level_verification_timeout] = '30000'

    create!(
      level_params.
        merge(user: params[:user], game: Game.craft, level_num: 'custom').
        merge(default_game_params)
    )
  end

  # Attributes that are stored as JSON strings but should be passed through to the app as
  # actual JSON objects.  You can list attributes in snake_case here for consistency, but this method
  # returns camelCase properties because of where it's used in the pipeline.
  def self.json_object_attrs
    %w(
      ground_plane
      ground_decoration_plane
      action_plane
      player_start_position
      player_start_direction
      agent_start_position
      agent_start_direction
      available_blocks
      if_block_options
      place_block_options
      drop_dropdown_options
      play_sound_options
      songs
    ).map {|x| x.camelize(:lower)}
  end

  def self.skins
    ['craft']
  end

  def adventurer_blocks
    <<-XML.chomp
<category name="Actions">
  <block type='craft_moveForward'></block>
  <block type="craft_turn">
    <title name="DIR">left</title>
  </block>
  <block type="craft_turn">
    <title name="DIR">right</title>
  </block>
  <block type='craft_destroyBlock'></block>
  <block type='craft_shear'></block>
  <block type='craft_placeBlock'></block>
  <block type='craft_placeTorch'></block>
  <block type='craft_plantCrop'></block>
  <block type='craft_tillSoil'></block>
  <block type='craft_placeBlockAhead'></block>
  <block type="when_run"></block>
</category>
    XML
  end

  def agent_blocks
    <<-XML.chomp
<category name="Actions">
  <block type='craft_moveForward'></block>
  <block type='craft_moveBackward'></block>
  <block type="craft_turn">
    <title name="DIR">left</title>
  </block>
  <block type="craft_turn">
    <title name="DIR">right</title>
  </block>
  <block type='craft_destroyBlock'></block>
  <block type='craft_placeBlock'></block>
  <block type="when_run"></block>
</category>
    XML
  end

  def event_blocks
    <<-XML.chomp
<category name="Event Loops">
  <block type="craft_forever"></block>
  <block type="craft_repeatDropdown"></block>
  <block type="craft_repeatRandom"></block>
  <block type="craft_repeatTimes"></block>
</category>
<category name="Global Actions">
  <block type='craft_playSound'></block>
  <block type='craft_addScore'></block>
  <block type="craft_spawnEntity"></block>
  <block type="craft_spawnEntityRandom"></block>
</category>
<category name="Entity Actions">
  <block type="craft_attack"></block>
  <block type="craft_destroyEntity"></block>
  <block type="craft_drop"></block>
  <block type="craft_explodeEntity"></block>
  <block type="craft_flashEntity"></block>
  <block type="craft_moveAway"></block>
  <block type="craft_moveDirection"></block>
  <block type="craft_moveForward"></block>
  <block type="craft_moveRandom"></block>
  <block type="craft_moveTo"></block>
  <block type="craft_moveToward"></block>
  <block type="craft_entityTurn"></block>
  <block type="craft_entityTurnLR"></block>
  <block type="craft_wait"></block>
</category>
<category name="Limited Actions">
  <block type="craft_moveTowardSheepPlayerChicken"></block>
</category>
<category name="Limited Entities">
  <block type="craft_chickenSpawned"></block>
  <block type="craft_sheepSpawnedClicked"></block>
  <block type="craft_creeperSpawnedTouchedClicked"></block>
  <block type="craft_sheepClicked"></block>
  <block type="craft_chickenSpawnedClicked"></block>
  <block type="craft_sheepSpawnedTouchedClicked"></block>
  <block type="craft_cowSpawnedTouchedClicked"></block>
  <block type="craft_zombieSpawnedTouchedClickedDay"></block>
  <block type="craft_creeperSpawnedTouchedClickedDay"></block>
  <block type="craft_zombieNoDayNight"></block>
  <block type="craft_ironGolemNoDayNight"></block>
</category>
<category name="Entities">
  <block type="craft_sheep"></block>
  <block type="craft_zombie"></block>
  <block type="craft_ironGolem"></block>
  <block type="craft_creeper"></block>
  <block type="craft_cow"></block>
  <block type="craft_chicken"></block>
</category>
<category name="Global Events">
  <block type="craft_whenRun"></block>
  <block type="craft_whenDay"></block>
  <block type="craft_whenNight"></block>
</category>
    XML
  end

  def common_blocks(type)
    level_specific_blocks =
      if is_event_level == "true"
        event_blocks
      elsif is_agent_level == "true"
        agent_blocks
      else
        adventurer_blocks
      end

    <<-XML.chomp
#{level_specific_blocks}
<category name="Loops">
  <block type='controls_repeat'>
    <title name='TIMES'>5</title>
  </block>
  <block type="controls_repeat_dropdown">
    <title name="TIMES" config="2-10">???</title>
  </block>
  <block type="controls_repeat_dropdown">
    <title name="TIMES" config="2-10">3</title>
  </block>
  <block type='controls_repeat_ext'></block>
  <block type="controls_for" inline="true">
    <title name="VAR">i</title>
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
</category>
<category name="Variables" custom="VARIABLE"></category>
<category name="Logic">
  <block type='craft_ifLavaAhead'></block>
  <block type='craft_ifBlockAhead'></block>
</category>
    XML
  end

  def toolbox(type)
    <<-XML.chomp
<category name="Category">
  <block type="category"></block>
</category>
#{common_blocks(type)}
    XML
  end
end
