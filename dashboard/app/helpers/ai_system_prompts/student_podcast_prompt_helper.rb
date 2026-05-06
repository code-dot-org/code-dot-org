module AiSystemPrompts::StudentPodcastPromptHelper
  def self.get_openai_system_prompt(lesson_id, objective_ids, user_id = nil)
    lesson_plan = get_lesson_materials(lesson_id, objective_ids)
    intro = "You are an expert computer science teacher for middle and high school. You
are writing a script for a conversational podcast between two characters, Dan and Sam.
The audience for this podcast is students in your class, with an age range of 12-18.
The goal is to help your students review the learning objectives in a lesson after they
have completed the lesson. Dan represents the student. He is a curious learner, asks
questions, reflects on confusion, and surfaces the student perspective. His tone should
be informal and slightly uncertain. Sam represents the teacher. She is a relatable expert
on the subject matter, explains concepts clearly, offers analogies, and keeps the
conversation grounded.

The podcast should consist of the following short segments:
1. Intro: Dan and Sam introduce the lesson and the question of the day from the lesson.
2. Lesson Overview: Sam provides a summary of the most important takeaways from the lesson.
If there are discussion or 'Check for Understanding' questions in the lesson, Dan will ask
about them and both hosts will discuss how to answer them.
3. Learning Objectives: One segment per learning objective in the lesson. Dan will introduce
each learning objective by asking a question about it. His questions should reflect common
student misunderstandings about the material. Sam will provide clear answers
and examples in response.
4. Closing: Dan and Sam will close out the podcast by coming back to the question of the day to
discuss and answer it.

The language in each segment should be geared toward students in a middle and high school
setting and should be friendly and conversational. Each segment should transition naturally
from one to the next Avoid academic or formal language. Use contractions. Keep sentences
short. Never introduce a technical term without immediately explaining it in plain language.
Do not use passive voice, numbered lists, or academic phrasing in the dialog.

The podcast should use examples from the provided resources, but also offer at least one
alternative explanation drawn from everyday experiences familiar to teenagers: games,
social media, smartphones, school life. By the end of the podcast, a listener should
understand the learning objectives in at least 2 different ways. The podcast should be,
at most, 3 minutes long.

The script should be returned in JSON format as a list of dialog objects with the following format:
{'voice_id': the name of the character speaking (Dan or Sam), 'text': The lines spoken by the character}

"

    prompt = intro + "Use the following lesson plan and learning objectives to generate the podcast script:

Lesson Name: #{lesson_plan[:name]}
Lesson Overview: #{lesson_plan[:overview]}
Learning Objectives: #{lesson_plan[:objectives].to_json}
#{'Lesson Purpose: ' + lesson_plan[:purpose] if lesson_plan[:purpose]}
#{'Assessment Opportunities: ' + lesson_plan[:assessment_opportunities] if lesson_plan[:assessment_opportunities]}
Standards: #{lesson_plan[:standards].to_json}
#{'Opportunity Standards: ' + lesson_plan[:opportunity_standards].to_json.to_s if lesson_plan[:opportunity_standards]}
Activities: #{lesson_plan[:activities].to_json}
Preparation: #{lesson_plan[:preparation]}
Vocabulary: #{lesson_plan[:vocabularies].to_json}
Unit overview: #{lesson_plan[:unit_overview].to_json}
"
    puts prompt
    prompt
  end

  def self.get_lesson_materials(lesson_id, objective_ids)
    lesson = Lesson.find(lesson_id)
    lesson_materials = lesson.summarize_for_lesson_show(current_user, true)
    @lesson_plan = {}
    @lesson_plan[:name] = lesson.name
    @lesson_plan[:overview] = lesson_materials[:overview]
    @lesson_plan[:objectives] = []
    lesson.objectives.each do |o|
      @lesson_plan[:objectives] << o.description if objective_ids.include?(o.id)
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
    localized_desc = Unit.find(lesson.script_id)&.localized_description
    @lesson_plan[:unit_overview] = localized_desc ? Services::MarkdownPreprocessor.process(localized_desc) : nil
    @lesson_plan
  end
end
