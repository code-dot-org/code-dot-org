require_relative '../test_helper'
require 'cdo/section_helpers'

class SectionHelpersTest < Minitest::Test
  describe 'random code' do
    it 'generates a 6 char random code' do
      CodeGeneration.expects(:random_code).with(6)
      SectionHelpers.random_code
    end
  end
end
