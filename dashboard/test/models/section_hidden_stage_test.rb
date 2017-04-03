require 'test_helper'

class SectionHiddenStageTest < ActiveSupport::TestCase
  test "can only manage SectionHiddenStage for section you own" do
    teacher1 = create(:teacher)
    teacher2 = create(:teacher)
    student = create(:student)

    stage = create :stage

    # Create section owned by teacher 1.
    section = Section.create!(user: teacher1, name: "section 1")

    assert Ability.new(teacher1).can?(:manage, SectionHiddenStage.create(stage_id: stage.id, section_id: section.id))
    assert !Ability.new(teacher2).can?(:manage, SectionHiddenStage.create(stage_id: stage.id, section_id: section.id))
    assert !Ability.new(student).can?(:manage, SectionHiddenStage.create(stage_id: stage.id, section_id: section.id))
  end
end
