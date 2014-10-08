class Maze < Grid
  serialized_attrs :start_direction, :step_mode

  # List of possible skins, the first is used as a default.
  def self.skins
    ['birds', 'pvz']
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
<block type='maze_moveForward'></block>
<block type='maze_move'></block>
<block type='maze_turn'>
  <title name='DIR'>turnLeft</title>
</block>
<block type='maze_turn'>
  <title name='DIR'>turnRight</title>
</block>
<block type='controls_repeat'>
  <title name='TIMES'>5</title>
</block>
<block type="controls_repeat_dropdown">
  <title name="TIMES" config="3-10">3</title>
</block>
<block type='controls_repeat_ext'>
</block>
    XML
  end

  def k1_blocks
    <<-XML.chomp
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
    XML
  end

  def toolbox(type)
    <<-XML.chomp
<block type="procedures_defnoreturn"><title name="NAME">CATEGORY=Category</title></block>
#{common_blocks(type)}
<block type="maze_forever"></block>
<block type="maze_if"></block>
<block type="maze_ifElse"></block>
    XML
  end
end
