module AiLessonSummariesHelper
  def self.get_lesson_materials(lesson_id)
    lesson = Lesson.find(lesson_id).summarize_for_lesson_show(current_user, true)
    @lesson_materials = {}
    @lesson_materials[:overview] = lesson.overview
    @lesson_materials[:purpose] = lesson.purpose
    @lesson_materials[:assessment_opportunities] = lesson.assessment_opportunities
    @lesson_materials[:standards] = []
    lesson.standards.each do |s|
      @lesson_materials[:standards] << s.description
    end
    @lesson_materials[:opportunity_standards] = []
    lesson.opportunity_standards.each do |s|
      @lesson_materials[:opportunity_standards] << s.description
    end
    @lesson_materials[:activities] = lesson.activities
    @lesson_materials
  end
end
