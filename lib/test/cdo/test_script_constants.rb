require_relative '../test_helper'
require 'cdo/script_constants'

class ScriptConstantsTest < Minitest::Test
  describe 'script_in_category?' do
    it 'finds artist in the hoc category' do
      assert ScriptConstants.script_in_category?(:hoc, 'artist')
    end

    it 'does not find other scripts in the hoc category' do
      assert !ScriptConstants.script_in_category?(:hoc, 'csd1')
      assert !ScriptConstants.script_in_category?(:hoc, 'foo')
    end
  end

  describe 'script_in_any_category?' do
    it 'finds artist and csd1' do
      assert ScriptConstants.script_in_any_category?('artist')
      assert ScriptConstants.script_in_any_category?('csd1')
    end

    it 'does not find nonexistent scripts' do
      assert !ScriptConstants.script_in_any_category?('foo')
    end
  end
end
