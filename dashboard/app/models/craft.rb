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

require "csv"

class Craft < Blockly
  # before_save :update_maps

  serialized_attrs :ground_plane,
                   :ground_decoration_plane,
                   :action_plane,
                   :player_start_position,
                   :available_blocks,
                   :if_block_options,
                   :place_block_options,
                   :player_start_direction,
                   :verification_function,
                   :show_popup_on_load,
                   :is_daytime,
                   :special_level_type,
                   :grid_width,
                   :grid_height,
                   :free_play

  JSON_LEVEL_MAPS = [
      :ground_plane,
      :ground_decoration_plane,
      :action_plane
  ]

  EMPTY_STRING = ''
  DEFAULT_MAP_VALUE = EMPTY_STRING # no item

  ALL_BLOCKS = {
      EMPTY_STRING => true,
      bedrock: true,
      bricks: true,
      clay: true,
      oreCoal: true,
      dirtCoarse: true,
      cobblestone: true,
      oreDiamond: true,
      dirt: true,
      oreEmerald: true,
      farmlandWet: true,
      glass: true,
      oreGold: true,
      grass: true,
      gravel: true,
      houseTopA: true,
      houseRightC: true,
      houseRightB: true,
      houseLeftA: true,
      houseRightA: true,
      houseBottomA: true,
      houseBottomB: true,
      houseBottomC: true,
      houseBottomD: true,
      clayHardened: true,
      oreIron: true,
      oreLapis: true,
      lava: true,
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
      oreRedstone: true,
      sand: true,
      sandstone: true,
      stone: true,
      tnt: true,
      water: true,
      wool: true
  }

  ALL_BLOCKS_ARRAY = "[\"#{ALL_BLOCKS.keys[1..-1].join('", "')}\"]"

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
    action_plane: ALL_BLOCKS.merge({
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
    })
  }

  TILES_TO_PREVIEW_IMAGES = {
      grass: '/blockly/media/skins/craft/images/Block_0000_Grass.png',
      logOak: '/blockly/media/skins/craft/images/Block_0008_log_oak.png',
      coarseDirt: '/blockly/media/skins/craft/images/Block_0002_coarse_dirt.png',
      leavesOak: '/blockly/media/skins/craft/images/Block_0014_leaves_oak.png',
      tallGrass: '/blockly/media/skins/craft/images/TallGrass.png',
      sheep: '/blockly/media/skins/craft/images/Sheep.png',
      treeOak: '/blockly/media/skins/craft/images/Leaves_Oak_Decay.png',
  }

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
}'

  }

  def self.player_start_directions
    [['Up', 0], ['Right', 1], ['Down', 2], ['Left', 3]]
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
      ['Minecart level', 'minecart']
    ]
  end

  def get_width
    self.grid_width || 10
  end

  def get_height
    self.grid_height || 10
  end

  def self.create_from_level_builder(params, level_params)
    default_game_params = {}
    default_game_params[:ground_plane] = '[' + ([(['"grass"'] * 10).join(',')] * 10).join(",\n") + ']'
    default_game_params[:ground_decoration_plane] = '[' + ([(['""'] * 10).join(',')] * 10).join(",\n") + ']'
    default_game_params[:action_plane] = '[' + ([(['""'] * 10).join(',')] * 10).join(",\n") + ']'
    default_game_params[:player_start_position] = '[0, 0]'
    default_game_params[:grid_width] = '10'
    default_game_params[:grid_height] = '10'
    default_game_params[:is_daytime] = true

    default_game_params[:verification_function] = SAMPLE_VERIFICATION_FUNCTIONS[:isPlayerNextTo]

    create!(level_params.
                merge(user: params[:user], game: Game.craft, level_num: 'custom').
                merge(default_game_params))
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
      available_blocks
      if_block_options
      place_block_options
    ).map{ |x| x.camelize(:lower) }
  end

  def self.skins
    ['craft']
  end

  def common_blocks(type)
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
</category>
<category name="Loops">
  <block type='craft_whileBlockAhead'></block>
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
