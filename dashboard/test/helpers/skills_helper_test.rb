require 'test_helper'

class SkillsHelperTest < ActiveSupport::TestCase
  setup do
    @section = create(:section)
    @student1 = create(:student)
    @student2 = create(:student)
    @section.add_student(@student1)
    @section.add_student(@student2)

    @unit = create(:script, :with_levels, levels_count: 3)
    @level1 = @unit.script_levels.first.level
    @level2 = @unit.script_levels.second.level
    @level3 = @unit.script_levels.third.level

    @skill1 = create(:skill, key: 'survival', description: 'Survive the apocalypse')
    @skill2 = create(:skill, key: 'cuddle_cats', description: 'Cuddle cats effectively for maximum cat comfort')
    @skill3 = create(:skill, key: 'play_accordion', description: 'Play the accordion with skill and virtuosity')

    @level1.skills << [@skill1, @skill2]
    @level2.skills << [@skill2, @skill3]
    @level3.skills << @skill1
  end

  test "get_section_skills_data returns correct structure with evaluations" do
    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: @unit.id,
      skill_id: @skill1.id,
      level_id: @level1.id,
      evaluation: 'Great'
    )

    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: @unit.id,
      skill_id: @skill2.id,
      level_id: @level1.id,
      evaluation: 'Ok'
    )

    create(:user_level_skill_evaluation,
      student_id: @student2.id,
      unit_id: @unit.id,
      skill_id: @skill1.id,
      level_id: @level1.id,
      evaluation: 'Needs revision'
    )

    result = SkillsHelper.get_section_skills_data(@section, @unit)

    assert_equal 2, result.keys.length
    assert result.key?(@student1.id)
    assert result.key?(@student2.id)

    student1_data = result[@student1.id]
    assert_equal 3, student1_data.keys.length

    skill1_data = student1_data[@skill1.id]
    assert_equal 'Mastered', skill1_data[:mastery_level]

    skill2_data = student1_data[@skill2.id]
    assert_equal 'Shown', skill2_data[:mastery_level]

    skill3_data = student1_data[@skill3.id]
    assert_equal 'Not seen', skill3_data[:mastery_level]

    student2_data = result[@student2.id]
    assert_equal 3, student2_data.keys.length

    skill1_data = student2_data[@skill1.id]
    assert_equal 'Needs practice', skill1_data[:mastery_level]

    skill2_data = student2_data[@skill2.id]
    assert_equal 'Not seen', skill2_data[:mastery_level]

    skill3_data = student2_data[@skill3.id]
    assert_equal 'Not seen', skill3_data[:mastery_level]
  end

  test "get_section_skills_data handles empty section" do
    empty_section = create(:section)

    result = SkillsHelper.get_section_skills_data(empty_section, @unit)

    assert_equal({}, result)
  end

  test "get_section_skills_data handles unit with no skills" do
    unit_no_skills = create(:script, :with_levels, levels_count: 2)

    result = SkillsHelper.get_section_skills_data(@section, unit_no_skills)

    assert_equal 2, result.keys.length
    assert result.key?(@student1.id)
    assert result.key?(@student2.id)
    assert_equal({}, result[@student1.id])
    assert_equal({}, result[@student2.id])
  end

  test "get_section_skills_data handles students with no evaluations" do
    result = SkillsHelper.get_section_skills_data(@section, @unit)

    [@student1.id, @student2.id].each do |student_id|
      student_data = result[student_id]
      [@skill1.id, @skill2.id, @skill3.id].each do |skill_id|
        assert_equal 'Not seen', student_data[skill_id][:mastery_level]
      end
    end
  end

  test "get_section_skills_data handles multiple evaluations for same student-skill" do
    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: @unit.id,
      skill_id: @skill1.id,
      level_id: @level1.id,
      evaluation: 'Needs revision'
    )

    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: @unit.id,
      skill_id: @skill1.id,
      level_id: @level2.id,
      evaluation: 'Ok'
    )

    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: @unit.id,
      skill_id: @skill1.id,
      level_id: @level3.id,
      evaluation: 'Great'
    )

    result = SkillsHelper.get_section_skills_data(@section, @unit)

    assert_equal 'Mastered', result[@student1.id][@skill1.id][:mastery_level]
  end

  test "determine_mastery_level_for_student returns 'Not seen' for empty evaluations" do
    result = SkillsHelper.send(:determine_mastery_level_for_student, [])
    assert_equal 'Not seen', result
  end

  test "determine_mastery_level_for_student returns 'Mastered' when Great is present" do
    evaluations = ['Needs revision', 'Ok', 'Great']
    result = SkillsHelper.send(:determine_mastery_level_for_student, evaluations)
    assert_equal 'Mastered', result
  end

  test "determine_mastery_level_for_student returns 'Shown' when Ok is present but no Great" do
    evaluations = ['Needs revision', 'Ok', 'Needs revision']
    result = SkillsHelper.send(:determine_mastery_level_for_student, evaluations)
    assert_equal 'Shown', result
  end

  test "determine_mastery_level_for_student returns 'Needs practice' when all are 'Needs revision'" do
    evaluations = ['Needs revision', 'Needs revision', 'Needs revision']
    result = SkillsHelper.send(:determine_mastery_level_for_student, evaluations)
    assert_equal 'Needs practice', result
  end

  test "determine_mastery_level_for_student returns 'Not seen' for unrecognized evaluations" do
    evaluations = ['Unknown', 'Invalid']
    result = SkillsHelper.send(:determine_mastery_level_for_student, evaluations)
    assert_equal 'Not seen', result
  end

  test "get_section_skills_data filters evaluations by unit_id" do
    other_unit = create(:script, :with_levels, levels_count: 1)
    other_unit_level = other_unit.script_levels.first.level
    other_unit_level.skills << @skill1

    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: other_unit.id,
      skill_id: @skill1.id,
      level_id: other_unit_level.id,
      evaluation: 'Great'
    )

    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: @unit.id,
      skill_id: @skill1.id,
      level_id: @level1.id,
      evaluation: 'Ok'
    )

    result = SkillsHelper.get_section_skills_data(@section, @unit)

    assert_equal 'Shown', result[@student1.id][@skill1.id][:mastery_level]
  end
end
