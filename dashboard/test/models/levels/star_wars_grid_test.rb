require 'test_helper'

class StarWarsGridTest < ActiveSupport::TestCase
  def setup
    @star_wars_grid = StarWarsGrid.new
  end

  test 'uses_google_blockly? returns true' do
    assert @star_wars_grid.uses_google_blockly?
  end
end
