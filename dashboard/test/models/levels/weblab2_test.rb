require 'test_helper'

class Weblab2Test < ActiveSupport::TestCase
  # Assert only on this attribute's errors: the rest of Level's validations are
  # not what these tests are about.
  test 'ai_tutor_dependency accepts essential, available, or nothing' do
    [nil, '', SharedConstants::AI_CHAT_TOOLS_DEPENDENCY[:ESSENTIAL], SharedConstants::AI_CHAT_TOOLS_DEPENDENCY[:AVAILABLE]].each_with_index do |value, index|
      level = Weblab2.new(name: "weblab2_dependency_#{index}", level_num: 'custom', ai_tutor_dependency: value)
      level.valid?
      assert_empty level.errors[:ai_tutor_dependency], "expected #{value.inspect} to be a valid ai_tutor_dependency"
    end
  end

  test 'ai_tutor_dependency rejects any other value' do
    level = Weblab2.new(name: 'weblab2_dependency_junk', level_num: 'custom', ai_tutor_dependency: 'none')
    level.valid?
    refute_empty level.errors[:ai_tutor_dependency]
  end
end
