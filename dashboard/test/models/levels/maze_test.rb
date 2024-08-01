require 'test_helper'

class MazeTest < ActiveSupport::TestCase
  def setup
    @maze = Maze.new
  end

  test 'uses_google_blockly? returns true' do
    assert @maze.uses_google_blockly?
  end
end
