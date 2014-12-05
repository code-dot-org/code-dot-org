class Minecraft < Blockly
  serialized_attrs %w(
    solution_blocks
    free_play
  )

  before_save :update_ideal_level_source

  def xml_blocks
    super + %w(solution_blocks)
  end

  def self.builder
    @@eval_builder ||= Level.find_by(name: 'builder')
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    ['minecraft']
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
        user: params[:user],
        game: Game.minecraft,
        level_num: 'custom',
        properties: {
          solution_blocks: params[:program] || '',
          toolbox_blocks: "<xml>#{toolbox}</xml>",
        }
    ))
  end

  def self.toolbox
    <<-XML.strip_heredoc.chomp
      <block type="when_run"></block>
      <block type="minecraft_whenRightClick"></block>
      <block type="minecraft_whenLeftClick"></block>
      <block type="minecraft_setGravity">
        <title name="VALUE">-1.7999999499807017e-7</title>
      </block>
      <block type="minecraft_setSpeed">
        <title name="VALUE">0.0028</title>
      </block>
      <block type="minecraft_setBlock" inline="false"></block>
      <block type="math_random_int" inline="true">
        <value name="FROM">
          <block type="math_number">
            <title name="NUM">1</title>
          </block>
        </value>
        <value name="TO">
          <block type="math_number">
            <title name="NUM">37</title>
          </block>
        </value>
      </block>
      <block type="minecraft_adjacent_target_x"></block>
      <block type="minecraft_adjacent_target_y"></block>
      <block type="minecraft_adjacent_target_z"></block>
      <block type="minecraft_selected_target_x"></block>
      <block type="minecraft_selected_target_y"></block>
      <block type="minecraft_selected_target_z"></block>
      <block type="minecraft_log"></block>
      <block type="controls_repeat">
        <title name="TIMES">4</title>
      </block>
      <block type="controls_repeat_dropdown">
        <title name="TIMES" config="3-10">???</title>
      </block>
      <block type="controls_repeat_ext" inline="true"></block>
      <block type="math_number">
        <title name="NUM">0</title>
      </block>
      <block type="math_number_dropdown">
        <title name="NUM" config="1-10">5</title>
      </block>
      <block type="math_arithmetic" inline="true">
        <title name="OP">ADD</title>
      </block>
      <block type="math_random_int" inline="true">
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
      <block type="math_random_float"></block>
      <block type="variables_set" inline="false">
        <title name="VAR">x</title>
        <value name="VALUE">
          <block type="math_number">
            <title name="NUM">???</title>
          </block>
        </value>
      </block>
      <block type="variables_get">
        <title name="VAR">x</title>
      </block>
    XML
  end

  def toolbox(type)
    Minecraft.toolbox
  end
end
