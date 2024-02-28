require 'test_helper'

class GamelabJrTest < ActiveSupport::TestCase
  def setup
    @gamelab_jr = GamelabJr.new
  end

  test 'uses_google_blockly? returns true' do
    assert @gamelab_jr.uses_google_blockly?
  end
end
