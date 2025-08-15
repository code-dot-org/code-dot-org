require 'test_helper'

class SkillTest < ActiveSupport::TestCase
  test "can serialize and seed course offerings" do
    skill = create(:skill, key: 'skill-1', description: 'description-1', concept: 'concept-1', evaluation_criteria: 'criteria-1')
    serialization = skill.serialize
    previous_skill = skill.freeze
    skill.destroy!
    File.stubs(:read).returns(serialization.to_json)

    new_skill_key = Skill.seed_record("config/skills/skill-1.json")
    new_skill = Skill.find_by(key: new_skill_key)
    assert_equal previous_skill.attributes.except('id', 'created_at', 'updated_at'),
      new_skill.attributes.except('id', 'created_at', 'updated_at')
  end
end
