require 'test_helper'

class SectionHiddenStageTest < ActiveSupport::TestCase
  test "can only manage SectionHiddenStage for section you own" do
    teacher = create :teacher
    other_teacher = create :teacher
    student = create :student
    stage = create :stage
    section = create :section, user: teacher
    section_hidden_stage = create :section_hidden_stage, section: section, stage: stage

    assert Ability.new(teacher).can?(:manage, section_hidden_stage)
    refute Ability.new(other_teacher).can?(:manage, section_hidden_stage)
    refute Ability.new(student).can?(:manage, section_hidden_stage)
  end
end
