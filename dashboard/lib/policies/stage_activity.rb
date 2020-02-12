class Policies::StageActivity
  # A user has "completed" a stage if they have completed at least 60% of the levels within the stage.
  def self.completed_by_user?(user, stage)
    return false unless user
    return false unless stage

    number_of_levels_in_stage = stage.script_levels.count

    stage_level_ids = stage.script_levels.map(&:level).pluck(:id)

    number_of_completed_levels_in_stage = user.user_levels.where(level_id: stage_level_ids).select(&:passing?).count

    (number_of_completed_levels_in_stage.to_f / number_of_levels_in_stage) >= 0.6
  end

  # A section has "completed" a stage if 80% of the users in the section have completed 60% of levels within the stage.
  def self.completed_by_section?(section, stage)
    return false unless section
    return false unless stage

    number_of_students_in_section = section.students.count

    number_of_students_who_completed_stage = 0
    section.students.each do |student|
      if completed_by_user?(student, stage)
        number_of_students_who_completed_stage += 1
      end
    end

    (number_of_students_who_completed_stage.to_f / number_of_students_in_section) >= 0.8
  end
end
