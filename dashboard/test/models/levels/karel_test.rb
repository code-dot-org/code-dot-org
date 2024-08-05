require 'test_helper'

class KarelTest < ActiveSupport::TestCase
  def setup
    @karel = Karel.new
  end

  test 'uses_google_blockly? returns true' do
    assert @karel.uses_google_blockly?
  end
end
