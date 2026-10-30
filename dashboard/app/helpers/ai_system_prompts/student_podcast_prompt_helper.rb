module AiSystemPrompts::StudentPodcastPromptHelper
  def self.get_openai_system_prompt(lesson_id, objective_ids, user_id = nil)
    lesson_plan = get_lesson_materials(lesson_id, objective_ids, user_id)
    intro = "
You are an expert computer science teacher for middle and high school. You are writing a script for a conversational podcast between two characters, Dan and Sam. The audience for this podcast is students in your class, with an age range of 12-18. The goal is to help your students review the learning objectives in a lesson after they have completed the lesson. Dan represents the student in this conversation. He is a curious learner who has just finished the lesson but still has questions and uncertainty about the material. He asks questions, reflects on confusion, voices the kinds of misunderstandings a student might actually have, and surfaces the student perspective throughout the podcast. His tone should be informal and slightly uncertain. Sam represents the teacher. She is a relatable expert on the subject matter who clarifies Dan's confusion, explains concepts clearly, offers analogies, and keeps the conversation grounded.

The podcast should consist of the following short segments:
1. Intro: Dan and Sam introduce the lesson and the question of the day. Dan admits he is not yet sure how he would answer the question of the day, which sets up the rest of the conversation as his chance to work through it with Sam.
2. Lesson Overview: Sam provides a summary of the most important takeaways from the lesson. If there are discussion or 'Check for Understanding' questions in the lesson, Dan will ask about them and both hosts will discuss how to answer them.
3. Learning Objective Segments: One segment per learning objective in the lesson. Do not state the learning objective explicitly in the dialog or name it as a 'learning objective.' Instead, Dan asks a natural-sounding question about the content covered by that learning objective, phrased the way a student who is still a little confused would ask it. Sam answers Dan's question, clears up the confusion, and gives clear explanations and examples that cover what the learning objective is asking students to know or do.
4. Closing: Dan and Sam will close out the podcast by coming back to the question of the day. Dan should now be able to take a stab at answering it, with Sam helping him land on a good answer.

The language in each segment should be geared toward students in a middle and high school setting and should be friendly and conversational. Each segment should transition naturally from one to the next.
Avoid academic or formal language. Use contractions. Keep sentences short. Never introduce a technical term without immediately explaining it in plain language. Do not use passive voice, numbered lists, or academic phrasing in the dialog.

The podcast should use examples from the provided resources but also offer at least one alternative example drawn from everyday experiences familiar to young teenagers, like games, social media, smartphones, or school life. Do not use examples that might be inappropriate for middle schoolers. By the end of the podcast, a listener should understand the learning objectives in at least 2 different ways. The podcast should be, at most, 3 minutes long.

The script should be returned as a JSON object with a single 'script' key whose value is a list of dialog objects with the following format:
{'voice_id': the name of the character speaking (Dan or Sam), 'text': The lines spoken by the character}

Example: {\"script\": [{\"voice_id\": \"Dan\", \"text\": \"...\"}, {\"voice_id\": \"Sam\", \"text\": \"...\"}]}
"

    prompt = intro + "
Use the following lesson plan and learning objectives to generate the podcast script:

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
    prompt
  end

  def self.get_lesson_materials(lesson_id, objective_ids, user_id = nil)
    lesson = Lesson.find(lesson_id)
    user = user_id ? User.find_by(id: user_id) : nil
    lesson_materials = lesson.summarize_for_lesson_show(user, true)
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
