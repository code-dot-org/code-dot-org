module SkillsHelper
  def self.get_section_skills_data(section, unit)
    student_ids = section.students.pluck(:id)
    skill_ids = unit.levels.joins(:skills).
                       pluck('skills.id').
                       uniq

    evaluations_data = UserLevelSkillEvaluation.where(
      student_id: student_ids,
      unit_id: unit.id,
      skill_id: skill_ids
    ).pluck(:student_id, :skill_id, :evaluation, :level_id, :created_at, :code_version)

    evaluation_records = filter_evaluations(evaluations_data).map do |student_id, skill_id, evaluation|
      {
        student_id: student_id,
        skill_id: skill_id,
        evaluation: evaluation
      }
    end

    evaluations_by_student_skill = evaluation_records.group_by {|record| [record[:student_id], record[:skill_id]]}

    result = {}

    student_ids.each do |student_id|
      result[student_id] = {}

      skill_ids.each do |skill_id|
        student_skill_evaluations = evaluations_by_student_skill[[student_id, skill_id]] || []
        evaluation_values = student_skill_evaluations.pluck(:evaluation)
        mastery_level = determine_mastery_level_for_student(evaluation_values)

        result[student_id][skill_id] = {
          mastery_level: mastery_level
        }
      end
    end

    result
  end

  # Only keep the most recent evaluation for each unique combination of student_id, skill_id, level_id, and code_version
  def self.filter_evaluations(evaluations_data)
    grouped_evaluations = evaluations_data.group_by do |student_id, skill_id, _evaluation, level_id, _created_at, code_version|
      [student_id, skill_id, level_id, code_version]
    end

    grouped_evaluations.map do |_key, group|
      group.max_by {|_student_id, _skill_id, _evaluation, _level_id, created_at, _code_version| created_at}
    end
  end

  # A basic method as an example of how we could determine mastery.
  def self.determine_mastery_level_for_student(evaluations)
    return "Not seen" if evaluations.empty?

    return "Mastered" if evaluations.include?(SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:ALL_COMPLETE_CORRECT])
    return "Shown" if evaluations.include?(SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT])
    return "Needs practice" if evaluations.all?(SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:INCOMPLETE_INCORRECT])

    "Not seen"
  end

  private_class_method :determine_mastery_level_for_student, :filter_evaluations
end
