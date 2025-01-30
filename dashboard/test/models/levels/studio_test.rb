require 'test_helper'

class StudioTest < ActiveSupport::TestCase
  def setup
    @studio = Studio.new
  end

  test 'uses_google_blockly? returns true' do
    assert @studio.uses_google_blockly?
  end
end
