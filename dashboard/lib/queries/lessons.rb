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
end
