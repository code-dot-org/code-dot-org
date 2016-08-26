require 'test_helper'

class SolutionBlocksTest < ActiveSupport::TestCase
  setup do
    @simple_solution_blocks = <<XML
<xml>
  <block type="when_run" deletable="false" movable="false">
    <next>
      <block type="controls_repeat">
        <title name="TIMES">2</title>
        <statement name="DO">
          <block type="maze_move">
            <title name="DIR">moveForward</title>
            <next>
              <block type="maze_nectar">
                <next>
                  <block type="maze_nectar"></block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </next>
  </block>
</xml>
XML

    @simple_level = Level.create(instructions: 'test', type: 'Karel', solution_blocks: @simple_solution_blocks)

    @simple_flattened_blocks = [
      '<block type="when_run"/>',
      '<block type="controls_repeat"/>',
      '<block type="maze_move"/>',
      '<block type="maze_nectar"/>',
      '<block type="maze_nectar"/>'
    ]

    @simple_toolbox_blocks = [
      '<block type="controls_repeat"/>',
      '<block type="maze_move"/>',
      '<block type="maze_nectar"/>'
    ]

    @function_solution_blocks = <<XML
<xml>
  <block type="procedures_defnoreturn" editable="false">
    <mutation></mutation>
    <title name="NAME">draw a line of squares</title>
    <statement name="STACK">
      <block type="controls_repeat_ext" inline="true">
        <value name="TIMES">
          <block type="math_number">
            <title name="NUM">6</title>
          </block>
        </value>
        <statement name="DO">
          <block type="procedures_callnoreturn">
            <mutation name="draw a square 20"></mutation>
            <next>
              <block type="jump" inline="true">
                <title name="DIR">jumpForward</title>
                <value name="VALUE">
                  <block type="math_number">
                    <title name="NUM">20</title>
                  </block>
                </value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </statement>
  </block>
  <block type="procedures_defnoreturn" editable="false">
    <mutation>
      <description>Draw a square with sides 20 pixels long</description>
    </mutation>
    <title name="NAME">draw a square 20</title>
    <statement name="STACK">
      <block type="draw_width" inline="false">
        <value name="WIDTH">
          <block type="math_number">
            <title name="NUM">1</title>
          </block>
        </value>
        <next>
          <block type="controls_repeat">
            <title name="TIMES">4</title>
            <statement name="DO">
              <block type="draw_move" inline="true">
                <title name="DIR">moveForward</title>
                <value name="VALUE">
                  <block type="math_number">
                    <title name="NUM">20</title>
                  </block>
                </value>
                <next>
                  <block type="draw_turn" inline="true">
                    <title name="DIR">turnLeft</title>
                    <value name="VALUE">
                      <block type="math_number">
                        <title name="NUM">90</title>
                      </block>
                    </value>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </statement>
  </block>
  <block type="when_run" deletable="false" movable="false">
    <next>
      <block type="procedures_callnoreturn">
        <mutation name="draw a line of squares"></mutation>
      </block>
    </next>
  </block>
</xml>
XML

    @function_level = Level.create(instructions: 'test', type: 'Artist', solution_blocks: @function_solution_blocks)

    @function_flattened_blocks = [
      "<block type=\"procedures_defnoreturn\">\n  <mutation/>\n</block>",
      "<block type=\"controls_repeat_ext\"/>",
      "<block type=\"math_number\"/>",
      "<block type=\"procedures_callnoreturn\">\n  <mutation name=\"draw a square 20\"/>\n</block>",
      "<block type=\"jump\"/>",
      "<block type=\"math_number\"/>",
      "<block type=\"procedures_defnoreturn\">\n  <mutation>\n    <description>Draw a square with sides 20 pixels long</description>\n  </mutation>\n</block>",
      "<block type=\"draw_width\"/>",
      "<block type=\"math_number\"/>",
      "<block type=\"controls_repeat\"/>",
      "<block type=\"draw_move\"/>",
      "<block type=\"math_number\"/>",
      "<block type=\"draw_turn\"/>",
      "<block type=\"math_number\"/>",
      "<block type=\"when_run\"/>",
      "<block type=\"procedures_callnoreturn\">\n  <mutation name=\"draw a line of squares\"/>\n</block>"
    ]

    @function_toolbox_blocks = [
      "<block type=\"controls_repeat\"/>",
      "<block type=\"controls_repeat_ext\"/>",
      "<block type=\"draw_move\"/>",
      "<block type=\"draw_turn\"/>",
      "<block type=\"draw_width\"/>",
      "<block type=\"jump\"/>",
      "<block type=\"math_number\"/>",
      "<block type=\"procedures_callnoreturn\">\n  <mutation name=\"draw a line of squares\"/>\n</block>",
      "<block type=\"procedures_callnoreturn\">\n  <mutation name=\"draw a square 20\"/>\n</block>"
    ]
  end

  test 'get solution blocks flattens and strips blocks' do
    assert_equal @simple_toolbox_blocks, @simple_level.get_solution_blocks
    assert_equal @simple_flattened_blocks, @simple_level.get_solution_blocks(false)
  end

  test 'get solution blocks preserves function calls' do
    assert_equal @function_toolbox_blocks, @function_level.get_solution_blocks
    assert_equal @function_flattened_blocks, @function_level.get_solution_blocks(false)
  end
end
