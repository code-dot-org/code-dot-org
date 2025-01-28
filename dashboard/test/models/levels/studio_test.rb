require 'test_helper'

class StudioTest < ActiveSupport::TestCase
  def setup
    @studio = Studio.new
  end

  test 'uses_google_blockly? returns true when DCDO flag is true' do
    DCDO.stubs(:get).with('playlab_google_blockly', true).returns(true)
    assert @studio.uses_google_blockly?
  end

  test 'uses_google_blockly? returns false when DCDO flag is false' do
    DCDO.stubs(:get).with('playlab_google_blockly', true).returns(false)
    refute @studio.uses_google_blockly?
  end
end
