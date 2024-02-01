require 'test_helper'

class GamelabJrTest < ActiveSupport::TestCase
  def setup
    @gamelab_jr = GamelabJr.new
  end

  test 'uses_google_blockly? returns true when DCDO flag is true' do
    DCDO.stubs(:get).with('sprite_lab_google_blockly', false).returns(true)
    assert @gamelab_jr.uses_google_blockly?
  end

  test 'uses_google_blockly? returns false when DCDO flag is false' do
    DCDO.stubs(:get).with('sprite_lab_google_blockly', false).returns(false)
    refute @gamelab_jr.uses_google_blockly?
  end
end
