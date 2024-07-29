require 'test_helper'

class MazeTest < ActiveSupport::TestCase
  def setup
    @maze = Maze.new
  end

  test 'uses_google_blockly? returns true when DCDO flag is true' do
    DCDO.stubs(:get).with('maze_sw_google_blockly', true).returns(true)
    assert @maze.uses_google_blockly?
  end

  test 'uses_google_blockly? returns false when DCDO flag is false' do
    DCDO.stubs(:get).with('maze_sw_google_blockly', true).returns(false)
    refute @maze.uses_google_blockly?
  end
end
