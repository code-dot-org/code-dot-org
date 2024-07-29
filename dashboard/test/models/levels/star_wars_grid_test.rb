require 'test_helper'

class StarWarsGridTest < ActiveSupport::TestCase
  def setup
    @star_wars_grid = StarWarsGrid.new
  end

  test 'uses_google_blockly? returns true when DCDO flag is true' do
    DCDO.stubs(:get).with('maze_sw_google_blockly', true).returns(true)
    assert @star_wars_grid.uses_google_blockly?
  end

  test 'uses_google_blockly? returns false when DCDO flag is false' do
    DCDO.stubs(:get).with('maze_sw_google_blockly', true).returns(false)
    refute @star_wars_grid.uses_google_blockly?
  end
end
