require_relative '../test_helper'
require 'cdo/section_helpers'

class SectionHelpersTest < Minitest::Test
  describe 'random code' do
    # TODO(asher): This test is wrong (probabilistically). Fix it.
    it 'does not generate the same code twice' do
      codes = 10.times.map {SectionHelpers.random_code}
      assert_equal 10, codes.uniq.length
    end

    it 'does not generate vowels' do
      codes = 10.times.map {SectionHelpers.random_code}
      assert codes.grep(/[AEIOU]/).empty?
    end

    it 'does not return naughty substrings' do
      SectionHelpers.stubs(:random_text).returns('BCDMNP', 'BCDFGH')
      assert_equal 'BCDFGH', SectionHelpers.random_code
    end
  end
end
