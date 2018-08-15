require_relative '../test_helper'
require 'cdo/code_generation'

class FakeModel
end

class CodeGenerationTest < Minitest::Test
  describe 'random unique code' do
    it 'does not generate vowels' do
      codes = 10.times.map {CodeGeneration.random_unique_code}
      assert codes.grep(/[AEIOU]/).empty?
    end

    it 'generates a code of the requested length' do
      (1..10).map do |length|
        code = CodeGeneration.random_unique_code length: length
        assert_equal length, code.length
      end
    end

    it 'defaults to length 6' do
      assert_equal 6, CodeGeneration.random_unique_code.length
    end

    it 'does not return naughty substrings' do
      CodeGeneration.expects(:random_consonant_string).with(6).returns('BCDMNP', 'BCDFGH').times(2)
      assert_equal 'BCDFGH', CodeGeneration.random_unique_code
    end

    it 'gives up after 100 attempts' do
      CodeGeneration.expects(:random_consonant_string).returns('BCDMNP').times(100)

      e = assert_raises RuntimeError do
        CodeGeneration.random_unique_code
      end
      assert_equal 'Unable to generate a valid code in 100 attempts.', e.message
    end

    it 'rejects codes and generates new ones' do
      reject_proc = ->(code) {code != 'CCCC'}
      CodeGeneration.expects(:random_consonant_string).returns('AAAA', 'BBBB', 'CCCC').times(3)

      code = CodeGeneration.random_unique_code reject_if: reject_proc
      assert_equal 'CCCC', code
    end

    it 'gives up after 100 attempts including reject proc' do
      reject_proc = ->(_code) {true}
      CodeGeneration.expects(:random_consonant_string).returns('BBBB').times(100)

      e = assert_raises RuntimeError do
        CodeGeneration.random_unique_code reject_if: reject_proc
      end
      assert_equal 'Unable to generate a valid code in 100 attempts.', e.message
    end

    it 'rejects codes from the supplied model' do
      FakeModel.expects(:exists?).with(has_key(:code)).returns(true, false, true, false, true, false).times(6)
      CodeGeneration.expects(:random_consonant_string).returns('XXXX', 'AAAA', 'YYYY', 'BBBB', 'ZZZZ', 'CCCC').times(6)

      code = CodeGeneration.random_unique_code model: FakeModel
      assert_equal 'AAAA', code

      code = CodeGeneration.random_unique_code model: 'FakeModel'
      assert_equal 'BBBB', code

      code = CodeGeneration.random_unique_code model: :FakeModel
      assert_equal 'CCCC', code
    end

    it 'rejects codes from the supplied model and code attribute' do
      FakeModel.expects(:exists?).with(has_key(:custom_code_attribute)).returns(true, true, false).times(3)
      CodeGeneration.expects(:random_consonant_string).returns('AAAA', 'BBBB', 'CCCC').times(3)

      code = CodeGeneration.random_unique_code model: FakeModel, code_attribute: 'custom_code_attribute'
      assert_equal 'CCCC', code
    end

    it 'checks deleted codes if model responds to :with_deleted' do
      class FakeModelWithDeleted
      end

      FakeModel.stubs(:with_deleted).returns(FakeModelWithDeleted)
      FakeModel.with_deleted.expects(:exists?).with(has_key(:custom_code_attribute)).returns(true, true, false).times(3)
      CodeGeneration.expects(:random_consonant_string).returns('AAAA', 'BBBB', 'CCCC').times(3)

      code = CodeGeneration.random_unique_code model: FakeModel, code_attribute: 'custom_code_attribute'
      assert_equal 'CCCC', code
    end
  end
end
