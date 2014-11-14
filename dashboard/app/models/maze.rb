class Maze < Grid
  serialized_attrs :start_direction, :step_mode

  # List of possible skins, the first is used as a default.
  def self.skins
    ['birds', 'pvz', 'scrat']
  end

  # An array of [name, value] pairs where the value is a start direction.
  def self.start_directions
    [['Up', 0], ['Right', 1], ['Down', 2], ['Left', 3]]
  end

  # An array of [name, value] pairs where the value is the step mode
  def self.step_modes
    [['Run Button Only', 0], ['Run and Step', 1], ['Step Button Only', 2]]
  end

  def common_blocks(type)
    <<-XML.chomp
#{k1_blocks}
<category name="Actions">
  <block type='maze_moveForward'></block>
  <block type='maze_move'></block>
  <block type='maze_move'>
    <title name='DIR'>???</title>
  </block>
  <block type='maze_turn'>
    <title name='DIR'>turnRight</title>
  </block>
  <block type='maze_turn'>
    <title name='DIR'>???</title>
  </block>
</category>
<category name="Loops">
  <block type='controls_repeat'>
    <title name='TIMES'>5</title>
  </block>
  <block type="controls_repeat_dropdown">
    <title name="TIMES" config="3-10">???</title>
  </block>
  <block type="controls_repeat_dropdown">
    <title name="TIMES" config="3-10">3</title>
  </block>
  <block type='controls_repeat_ext'></block>
  <block type="maze_forever"></block>
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
  <block type="maze_if"></block>
  <block type="maze_ifElse"></block>
</category>
    XML
  end

  def k1_blocks
    <<-XML.chomp
<category name="K1 Blocks">
  <block type="controls_repeat_simplified">
    <title name="TIMES">5</title>
  </block>
  <block type="controls_repeat_simplified_dropdown">
    <title name="TIMES" config="3-10">3</title>
  </block>
  <block type="maze_moveNorth"></block>
  <block type="maze_moveSouth"></block>
  <block type="maze_moveEast"></block>
  <block type="maze_moveWest"></block>
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
