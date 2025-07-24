require 'test_helper'
require 'cdo/shared_constants'
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
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT]
    )

    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: @unit.id,
      skill_id: @skill2.id,
      level_id: @level1.id,
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT]
    )

    create(:user_level_skill_evaluation,
      student_id: @student2.id,
      unit_id: @unit.id,
      skill_id: @skill1.id,
      level_id: @level1.id,
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT]
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
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT]
    )

    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: @unit.id,
      skill_id: @skill1.id,
      level_id: @level2.id,
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT]
    )

    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: @unit.id,
      skill_id: @skill1.id,
      level_id: @level3.id,
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT]
    )

    result = SkillsHelper.get_section_skills_data(@section, @unit)

    assert_equal 'Mastered', result[@student1.id][@skill1.id][:mastery_level]
  end

  test "determine_mastery_level_for_student returns 'Not seen' for empty evaluations" do
    result = SkillsHelper.send(:determine_mastery_level_for_student, [])
    assert_equal 'Not seen', result
  end

  test "determine_mastery_level_for_student returns 'Mastered' when all_complete_all_correct is present" do
    evaluations = [SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT]]
    result = SkillsHelper.send(:determine_mastery_level_for_student, evaluations)
    assert_equal 'Mastered', result
  end

  test "determine_mastery_level_for_student returns 'Shown' when partial_complete_correct is present but no all_complete_correct" do
    evaluations = [SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT]]
    result = SkillsHelper.send(:determine_mastery_level_for_student, evaluations)
    assert_equal 'Shown', result
  end

  test "determine_mastery_level_for_student returns 'Needs practice' when all are incomplete_incorrect" do
    evaluations = [SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT], SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT]]
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
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT]
    )

    create(:user_level_skill_evaluation,
      student_id: @student1.id,
      unit_id: @unit.id,
      skill_id: @skill1.id,
      level_id: @level1.id,
      evaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT]
    )

    result = SkillsHelper.get_section_skills_data(@section, @unit)

    assert_equal 'Shown', result[@student1.id][@skill1.id][:mastery_level]
  end

  test "filter_evaluations keeps most recent evaluation for each unique combination" do
    evaluations_data = [
      [@student1.id, @skill1.id, SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT], @level1.id, 1.day.ago, nil],
      [@student1.id, @skill1.id, SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT], @level1.id, Time.current, nil],
      [@student1.id, @skill1.id, SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT], @level2.id, 2.days.ago, 'CODE_VERSION_HASH_1'],
      [@student1.id, @skill1.id, SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT], @level2.id, 1.day.ago, 'CODE_VERSION_HASH_1'],
      [@student1.id, @skill1.id, SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT], @level2.id, Time.current, 'CODE_VERSION_HASH_2']
    ]

    result = SkillsHelper.send(:filter_evaluations, evaluations_data)

    assert_equal 3, result.length

    most_recent_level1_nil = result.find {|r| r[3] == @level1.id && r[5].nil?}
    assert_equal SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT], most_recent_level1_nil[2]

    most_recent_level2_v1 = result.find {|r| r[3] == @level2.id && r[5] == 'CODE_VERSION_HASH_1'}
    assert_equal SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT], most_recent_level2_v1[2]

    most_recent_level2_v2 = result.find {|r| r[3] == @level2.id && r[5] == 'CODE_VERSION_HASH_2'}
    assert_equal SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT], most_recent_level2_v2[2]
  end

  test "filter_evaluations handles empty array" do
    result = SkillsHelper.send(:filter_evaluations, [])
    assert_equal [], result
  end

  test "filter_evaluations handles single evaluation" do
    evaluations_data = [
      [@student1.id, @skill1.id, SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT], @level1.id, Time.current, nil]
    ]

    result = SkillsHelper.send(:filter_evaluations, evaluations_data)

    assert_equal 1, result.length
    assert_equal evaluations_data.first, result.first
  end

  test "filter_evaluations handles different students and skills" do
    evaluations_data = [
      [@student1.id, @skill1.id, SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT], @level1.id, 1.day.ago, nil],
      [@student1.id, @skill1.id, SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT], @level1.id, Time.current, nil],
      [@student2.id, @skill1.id, SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT], @level1.id, 2.days.ago, nil],
      [@student1.id, @skill2.id, SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT], @level1.id, Time.current, nil]
    ]

    result = SkillsHelper.send(:filter_evaluations, evaluations_data)

    assert_equal 3, result.length

    student1_skill1 = result.find {|r| r[0] == @student1.id && r[1] == @skill1.id}
    assert_equal SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT], student1_skill1[2]

    student2_skill1 = result.find {|r| r[0] == @student2.id && r[1] == @skill1.id}
    assert_equal SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT], student2_skill1[2]

    student1_skill2 = result.find {|r| r[0] == @student1.id && r[1] == @skill2.id}
    assert_equal SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT], student1_skill2[2]
  end
end
