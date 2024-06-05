require 'test_helper'

class CraftTest < ActiveSupport::TestCase
  def setup
    @gamelab_jr = Craft.new
  end

  test 'uses_google_blockly? returns true' do
    assert @gamelab_jr.uses_google_blockly?
  end
end
