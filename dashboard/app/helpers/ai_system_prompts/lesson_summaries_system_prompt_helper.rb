module AiSystemPrompts::LessonSummariesSystemPromptHelper
  def self.get_system_prompt(lesson_id)
    lesson_plan = get_lesson_materials(lesson_id)
    prompt = "Use the following lesson plan to generate your summary:

Lesson Name: #{lesson_plan[:name]}
Lesson Overview: #{lesson_plan[:overview]}
Learning Objectives: #{lesson_plan[:objectives].to_json}
#{'Lesson Purpose: '+lesson_plan[:purpose] if lesson_plan[:purpose]}
#{'Assessment Opportunities: '+lesson_plan[:assessment_opportunities] if lesson_plan[:assessment_opportunities]}
Standards: #{lesson_plan[:standards].to_json}
#{'Opportunity Standards: '+lesson_plan[:opportunity_standards].to_json.to_s if lesson_plan[:opportunity_standards]}
Activities: #{lesson_plan[:activities].to_json}
Preparation: #{lesson_plan[:preparation]}
Vocabulary: #{lesson_plan[:vocabularies].to_json}

Your summary should be returned in JSON format and should be composed as follows:
{learning_objective: this should be a brief, one paragraph summary of the lesson, focusing on each of the Learning Objectives and how they will be achieved,
lesson_beats: an ordered list of the main parts of the lesson, including activities and new vocabulary terms,
misconceptions: an unordered list including 2 - 3 misconceptions students might have about the material being covered,
tips: additional strategies or ideas to help with teaching the lesson}"
    prompt
  end

  def self.get_lesson_materials(lesson_id)
    lesson = Lesson.find(lesson_id)
    lesson_materials = lesson.summarize_for_lesson_show(current_user, true)
    @lesson_plan = {}
    @lesson_plan[:name] = lesson.name
    @lesson_plan[:overview] = lesson_materials[:overview]
    @lesson_plan[:objectives] = []
    lesson.objectives.each do |o|
      @lesson_plan[:objectives] << o.description
    end
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
    @lesson_plan[:preparation] = lesson.preparation
    @lesson_plan[:vocabularies] = []
    lesson_materials[:vocabularies].each do |v|
      @lesson_plan[:vocabularies] << {word: v[:word], definition: v[:definition]}
    end
    @lesson_plan
  end
end
