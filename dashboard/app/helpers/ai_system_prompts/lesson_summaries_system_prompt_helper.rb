module AiSystemPrompts::LessonSummariesSystemPromptHelper
  def self.get_system_prompt(lesson_id)
    lesson_plan = get_lesson_materials(lesson_id)
    prompt = "You are an expert teaching assistant in a computer science classroom who has been asked to summarize the upcoming lesson to help the teacher prepare for class. Use the following lesson plan to generate your summary:
Lesson Plan
Lesson Overview: #{lesson_plan[:overview]}
Learning Objectives: #{lesson_plan[:objectives]}
#{'Lesson Purpose: '+lesson_plan[:purpose] if lesson_plan[:purpose]}
Your summary should be composed of the following parts:
1. Learning Objective: this should be a brief, one paragraph summary of the lesson, focusing on each of the Learning Objectives and how they will be achieved
2. Key Lesson Beats: an ordered list of the main parts of the lesson, including activities and new vocabulary terms
3. Common Misconceptions: an unordered list including 2 - 3 misconceptions students might have about the material being covered"
    prompt
  end

  def self.get_lesson_materials(lesson_id)
    lesson = Lesson.find(lesson_id)
    lesson_materials = lesson.summarize_for_lesson_show(User.find_by_email('mark.teacher@code.org'), true)
    @lesson_plan = {}
    @lesson_plan[:overview] = lesson_materials[:overview]
    @lesson_plan[:purpose] = lesson.purpose
    @lesson_plan[:assessment_opportunities] = lesson.assessment_opportunities
    @lesson_plan[:standards] = []
    lesson.standards.each do |s|
      @lesson_plan[:standards] << s.description
    end
    @lesson_plan[:opportunity_standards] = []
    lesson.opportunity_standards.each do |s|
      @lesson_plan[:opportunity_standards] << s.description
    end
    @lesson_plan[:activities] = []
    lesson_materials[:activities].each do |a|
      activity = {name: a[:name]}
      activity[:sections] = []
      a[:activitySections].each do |section|
        sect = {description: "", levels: []}
        sect[:description] = section[:description]
        section[:scriptLevels].each do |sl|
          sl[:levels].each do |l|
            sect[:levels] << l[:longInstructions]
            l[:containedLevels].each do |cl|
              sect[:levels] << cl[:longInstructions]
            end
          end
        end
        activity[:sections] << sect
      end

      @lesson_plan[:activities] << activity
    end
    @lesson_plan[:objectives] = []
    lesson.objectives.each do |o|
      @lesson_plan[:objectives] << o.description
    end
    @lesson_plan[:preparation] = lesson.preparation
    @lesson_plan[:vocabularies] = []
    lesson_materials[:vocabularies].each do |v|
      @lesson_plan[:vocabularies] << {word: v[:word], definition: v[:definition]}
    end
    @lesson_plan[:programming_expressions] = []
    lesson_materials[:programmingExpressions].each do |pe|
      @lesson_plan[:programming_expressions] << pe[:name]
    end
    @lesson_plan
  end
end
