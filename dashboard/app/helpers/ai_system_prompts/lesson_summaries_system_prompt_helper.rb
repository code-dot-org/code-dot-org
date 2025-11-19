PERSONAS = {
  INNOVATOR: "Name: The Innovator
Tagline: Your classroom is where wild ideas come to life

Superpowers:
  -Educational Experimenter: You're always trying new tools, languages, or project formats to enhance learning
  -Creative Catalyst: You encourage experimental thinking and creative solutions in your students
  -Trendsetter: Other teachers ask YOU what's new and exciting in CS education

Ways AI Can Help:
  -AI expands your toolkit with new project extensions and resources, keeping your experiments flowing.
  -AI sparks imaginative prompts and remix ideas to fuel student creativity.
  -AI keeps you ahead by surfacing what's new in CS education.",
  WHISPERER: "Name: The Code Whisperer
Tagline: You have an uncanny ability to debug student thinking

Superpowers:
  -Logic Detective: You can pinpoint exactly where student reasoning goes astray
  -Master of Guiding Questions: You ask the perfect questions that lead students to their own discoveries
  -Problem-Solving Guru: Students seek you out when they're truly stuck and need expert guidance

Ways AI Can Help:
  -AI analyzes student work to uncover where thinking goes off track
  -AI generates Socratic-style prompts aligned to a student's specific struggle
  -Using our chat with Student Code Feature - AI provides targeted hints to keep students moving without giving away answers",
  BUILDER: "Name: The Bridge Builder
Tagline: You connect CS to everything students care about

Superpowers:
  -Master of Real-World Connections: You seamlessly integrate CS with art, music, social justice, and sports
  -Eye-Opening Educator: Students leave your class saying, \"I never knew coding could do that!\"
  -Relevance Wizard: You make abstract concepts meaningful by connecting them to student interests

Ways AI Can Help:
  -AI pulls in examples from art, sports, or current events.
  -AI suggests engaging demos that make students say, \"Whoa, coding can do that?\"
  -AI translates CS ideas into contexts that match your students' passions.",
  STORYTELLER: "Name: The Storyteller
Tagline: You make algorithms feel like adventures

Superpowers:
  -Narrative Master: You use stories, analogies, and themes to make complex concepts accessible
  -Memory Maker: Students remember your lessons through the vivid stories you tell
  -Abstract Translator: You make abstract concepts tangible and memorable through storytelling

Ways AI Can Help:
  -AI helps you build analogies and classroom \"plots\" that turn coding into adventure.
  -AI generates sticky metaphors and hooks that help lessons last.
  -AI provides playful mini-stories that make the abstract tangible.",
  ARCHITECT: "Name: The Community Architect
Tagline: You build collaborative coders, not just code

Superpowers:
  -Collaboration Champion: You focus on teamwork, code reviews, and peer learning experiences
  -Inclusion Expert: You create inclusive spaces where every student contributes and belongs
  -Team Builder: Your classroom feels more like a supportive dev team than a traditional class

Ways AI Can Help:
  -AI designs role-based activities that mirror real-world developer teamwork.
  -AI tailors strategies to help quiet students contribute and belong.
  -AI helps set up prompts for code reviews, daily developer check ins and group structures that build a supportive culture.",
  LEARNER: "Name: The Lead Learner
Tagline: You learn alongside your students, turning every challenge into a shared adventure.

Superpowers:
  -Co-Learner: You're comfortable not having all the answers, showing students that discovery, exploration, and even mistakes are part of the learning journey.
  -Curiosity Driver: You spark experimentation and model lifelong learning by exploring new tools and ideas alongside your students.
  -Growth Mindset Modeler: You build a classroom culture of teamwork and inclusion, where every student feels they belong.

Ways AI Can Help:
  -AI models \"thinking out loud\" alongside you, normalizing exploration.
  -AI fuels curiosity with prompts that invite tinkering and exploration.
  -AI designs role-based activities that mirror real-world dev teamwork."
}

module AiSystemPrompts::LessonSummariesSystemPromptHelper
  RESPONSE_FORMATS = {
    BRIEF_SUMMARY: "Your summary should be returned in JSON format and should be composed as follows:
    {learning_objective: this should be a brief, one paragraph summary of the lesson, focusing on each of the Learning Objectives and how they will be achieved,
    lesson_beats: an ordered list of the main parts of the lesson, including activities and new vocabulary terms,
    misconceptions: an unordered list including 2 - 3 misconceptions students might have about the material being covered,
    tips: additional strategies or ideas to help with teaching the lesson}",
    PODCAST_TRANSCRIPT: "Your summary should be the transcript of a podcast returned as a string. It should be written in the 2nd person directed at the listener and organized as follows:
    - First, start with the opening sentence: You're listening to AI Teaching Assistant's Daily Byte, your quick check-in before class
    - Second, give a one sentence overview that lists the lesson name and describes what its about
    - Third, describe if the lesson requires any materials and if it requires a laptop
    - Fourth, in one to two paragraphs summarize the lesson's Learning Objectives, an overview of what the lesson entails, and describe the activities and new vocabulary terms
    - Fifth, in one to two paragraphs summarize some strategies and ideas about how they can structure the lesson as well as some misconceptions students may have about the material
    - Sixth, end with a closing remark that repeats the name of the lesson and thanks them for listening.",
  }

  def self.get_system_prompt(lesson_id, user_id = nil, response_format = RESPONSE_FORMATS[:BRIEF_SUMMARY])
    lesson_plan = get_lesson_materials(lesson_id)
    intro = "You are an expert teaching assistant in a computer science classroom who has been asked to summarize the upcoming lesson to help the teacher prepare for class."
    personalization = if user_id
                        get_personalization(user_id)
                      elsif current_user
                        get_personalization(current_user.id)
                      else
                        ""
                      end

    prompt = intro + personalization + "Use the following lesson plan to generate your summary:

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

#{response_format}"
    prompt
  end

  def self.get_personalization(user_id)
    profile = TeachingProfileData.find_by(user_id: user_id)
    unless profile
      return nil
    end
    personalization_string = "Use the following information about the teacher to personalize your summary:"
    if profile.individual_data["yearsTeaching"]
      personalization_string << "\nThe teacher has #{profile.individual_data["yearsTeaching"]} years of experience in the classroom."
    end
    if profile.individual_data["selectedConfidence"]
      personalization_string << "\nThey rate their confidence with computer science concepts at #{profile.individual_data["selectedConfidence"]} out of 10, with 10 being extremely confident and 0 being not confident at all."
    end
    if profile.individual_data["selectedGoals"]
      personalization_string << "\nThey listed the following as their primary teaching goals:\n  -#{profile.individual_data["selectedGoals"].join("\n  -")}"
    end
    if profile.individual_data["selectedSupports"]
      personalization_string << "\nThey requested the following types of support from the assistant:\n  -#{profile.individual_data["selectedSupports"].join("\n  -")}"
    end
    if profile.individual_data["challenge"]
      personalization_string << "\nThey stated that their biggest challenge is: #{profile.individual_data["challenge"]}"
    end
    if profile.individual_data["classroomVision"]
      personalization_string << "\nTheir vision for their classroom is: #{profile.individual_data["classroomVision"]}"
    end
    if profile.individual_data["matchedPersona"]
      persona = case profile.individual_data["matchedPersona"]
                when "The Innovator"
                  PERSONAS[:INNOVATOR]
                when "The Code Whisperer"
                  PERSONAS[:WHISPERER]
                when "The Bridge Builder"
                  PERSONAS[:BUILDER]
                when "The Storyteller"
                  PERSONAS[:STORYTELLER]
                when "The Community Architect"
                  PERSONAS[:ARCHITECT]
                when "The Lead Learner"
                  PERSONAS[:LEARNER]
                end
      personalization_string << "\nThey were matched with the following teaching persona as part of a personalization quiz:\n#{persona}\n\n"
    end
    personalization_string
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
