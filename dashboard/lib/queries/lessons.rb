class Queries::Lessons
  # Returns the level in the given lesson that a student's code snapshot
  # (student code widget, exemplar code widget, AI snapshot prompt) is drawn
  # from. `nil` if the lesson has no such level.
  #
  # @param lesson [Lesson]
  # @return [Level, nil]
  def self.get_assessment_level_for_lesson(lesson)
    lesson.levels.where(type: %w[Pythonlab Weblab2]).last
  end

  # Returns the lesson's adaptive level, which is assumed to be the only level
  # in its lesson. `nil` if the lesson has none.
  #
  # @param lesson [Lesson]
  # @return [Adaptive, nil]
  def self.get_adaptive_level_for_lesson(lesson)
    lesson.levels.where(type: 'Adaptive').first
  end
end
