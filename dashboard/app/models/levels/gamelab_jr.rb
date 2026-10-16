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
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#  index_levels_on_type       (type)
#

class GamelabJr < Gamelab
  serialized_attrs %w(
    custom_helper_library
    custom_blocks
    hide_custom_blocks
    use_default_sprites
    block_pools
    mini_toolbox
    hide_pause_button
    blockly_variables
    instructions_icon
    standalone_app_name
    enable_big_playspace
    uses_lab2
    level_mode
    image_role_defaults
    add_blocks
    pinned_scene
    world_start_pattern
    guide_steps
    block_catalog
  )

  def shared_blocks
    Block.for(*block_pools.presence || type)
  end

  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil, unit_group_unit: nil)
    level_properties = super
    level_properties[:newBlocks] = new_block_types(script, script_level) if script && script_level
    level_properties
  end

  # The block types this level's toolbox offers that no earlier level of the
  # unit offered: the ones a student meets here first.
  def new_block_types(script, script_level)
    # Keyed on this level and the unit, as the localized options are: an
    # earlier level's toolbox edit reaches it when the unit is republished.
    Rails.cache.fetch("#{cache_key}/#{script.cache_key}/new_block_types", force: !Unit.should_cache?) do
      earlier = script.script_levels.take_while {|sl| sl.id != script_level.id}
      seen = earlier.flat_map(&:levels).select {|level| level.is_a?(GamelabJr)}.flat_map(&:offered_block_types)
      offered_block_types - seen
    end
  end

  # Types of the blocks this level hands a student: its toolbox, and the
  # blocks add_blocks places in the workspace ahead of them. Shadows are
  # not offers: a block's own inputs, or a dashed placeholder for a block
  # the toolbox already offers.
  def offered_block_types
    %w(toolbox_definition add_blocks).flat_map do |key|
      value = properties[key]
      value = JSON.parse(value) if value.is_a?(String)
      GamelabJr.block_types_in(value)
    rescue JSON::ParserError
      []
    end.uniq
  end

  def self.block_types_in(node, shadow: false)
    case node
    when Hash
      own = node['type'].is_a?(String) && !shadow && node['kind'] != 'category' ? [node['type']] : []
      own + node.flat_map {|key, value| block_types_in(value, shadow: shadow || key == 'shadow')}
    when Array
      node.flat_map {|value| block_types_in(value, shadow: shadow)}
    else
      []
    end
  end

  # Lab2 Sprite Lab starter assets are always uploaded by UUID.
  def add_starter_asset!(_, _)
    true
  end

  def self.standalone_app_names
    [
      ['Sprite Lab', 'spritelab'],
      ['Story', 'story'],
      ['Science', 'science'],
      ['Adaptations', 'adaptations'],
      ['Ecosystems', 'ecosystems'],
      ['Sprite Lab (Game Design)', 'game_design'],
      ['Transformers', 'transformers']
    ]
  end

  def standalone_app_name_or_default
    return standalone_app_name || 'spritelab'
  end

  def project_type
    return standalone_app_name_or_default
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
          mini_toolbox: false,
          hide_pause_button: false,
          standalone_app_name: 'spritelab'
        }
      )
    )
  end

  def common_blocks(type)
    <<~XML.chomp
      <category name="Start">
        <block type="when_run" />
      </category>
      <category name="Variables" custom="VARIABLE" />
      <category name="Functions" custom="PROCEDURE" />
      <category name="World" />
      <category name="Sprites" />
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
    <<~XML.chomp
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

  SAMPLE_VALIDATION_FUNCTIONS = {
    template:
'if (World.frameCount == 1) {
  addCriteria(function() {
    return minimumSprites(1); // Check whether or not the student created a sprite.
  }, "noSprites");  // Failure message: "You need to make a sprite."

  // Additional calls to addCriteria(), in order of precedence
}
check();
',

    advancedTemplate:
'if (World.frameCount == 1) {
  setFailTime(150); // Frames to wait before failing student
  setDelayTime(90); // Frames to wait after success before stopping program
  setSuccessMessage("genericExplore"); // Translated string to show upon success.
  setBonusSuccessMessage("genericBonusSuccess"); // Translated string to show upon success with bonus.

  addCriteria(function() {
    return minimumSprites(1); // Check whether or not the student created a sprite.
  }, "noSprites");  // Failure message: "You need to make a sprite."
  // Additional calls to addCriteria(), in order of precedence

  addBonusCriteria(function() {
    return minimumSprites(2); // Check whether or not the student created two sprites.
  });
  // Additional calls to addBonusCriteria(). (Student must complete one or more for special feedback.)

}
check();
',

    clickSpriteForSpeechExample:
'//Validate that a student created a sprite, then clicked a sprite to trigger a sprite to speak.
if (World.frameCount == 1) {
  addCriteria(function() {
    return minimumSprites(1);
  }, "noSprites");
  addCriteria(function() {
    return anySpriteClicked();
  }, "clickAnySprite");
  addCriteria(function(){
    return clickEventFound();
  }, "clickButNoEvent");
  addCriteria(function(){
    return clickEventFound() && anySpriteSpeaks();
  }, "clickButNoSay");
}

check();
'

  }.freeze
end
