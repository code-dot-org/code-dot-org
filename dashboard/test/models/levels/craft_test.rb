require 'test_helper'

class CraftTest < ActiveSupport::TestCase
  def setup
    @craft = Craft.new
  end

  test 'uses_google_blockly? returns true' do
    assert @craft.uses_google_blockly?
  end
end
