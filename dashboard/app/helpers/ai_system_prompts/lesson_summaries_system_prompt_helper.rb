# "teachingStyleInnovatorName": "The Innovator",
# "teachingStyleInnovatorTagline": "Your classroom is where wild ideas come to life",
# "teachingStyleInnovatorSuperpower1": "Educational Experimenter: You're always trying new tools, languages, or project formats to enhance learning",
# "teachingStyleInnovatorSuperpower2": "Creative Catalyst: You encourage experimental thinking and creative solutions in your students",
# "teachingStyleInnovatorSuperpower3": "Trendsetter: Other teachers ask YOU what's new and exciting in CS education",
# "teachingStyleInnovatorAiHelp1": "AI expands your toolkit with new project extensions and resources, keeping your experiments flowing.",
# "teachingStyleInnovatorAiHelp2": "AI sparks imaginative prompts and remix ideas to fuel student creativity.",
# "teachingStyleInnovatorAiHelp3": "AI keeps you ahead by surfacing what’s new in CS education.",
# "teachingStyleCodeWhispererName": "The Code Whisperer",
# "teachingStyleCodeWhispererTagline": "You have an uncanny ability to debug student thinking",
# "teachingStyleCodeWhispererSuperpower1": "Logic Detective: You can pinpoint exactly where student reasoning goes astray",
# "teachingStyleCodeWhispererSuperpower2": "Master of Guiding Questions: You ask the perfect questions that lead students to their own discoveries",
# "teachingStyleCodeWhispererSuperpower3": "Problem-Solving Guru: Students seek you out when they're truly stuck and need expert guidance",
# "teachingStyleCodeWhispererAiHelp1": "AI analyzes student work to uncover where thinking goes off track",
# "teachingStyleCodeWhispererAiHelp2": "AI generates Socratic-style prompts aligned to a student's specific struggle",
# "teachingStyleCodeWhispererAiHelp3": "Using our chat with Student Code Feature - AI provides targeted hints to keep students moving without giving away answers",
# "teachingStyleBridgeBuilderName": "The Bridge Builder",
# "teachingStyleBridgeBuilderTagline": "You connect CS to everything students care about",
# "teachingStyleBridgeBuilderSuperpower1": "Master of Real-World Connections: You seamlessly integrate CS with art, music, social justice, and sports",
# "teachingStyleBridgeBuilderSuperpower2": "Eye-Opening Educator: Students leave your class saying, \"I never knew coding could do that!\"",
# "teachingStyleBridgeBuilderSuperpower3": "Relevance Wizard: You make abstract concepts meaningful by connecting them to student interests",
# "teachingStyleBridgeBuilderAiHelp1": "AI pulls in examples from art, sports, or current events.",
# "teachingStyleBridgeBuilderAiHelp2": "AI suggests engaging demos that make students say, “Whoa, coding can do that?”",
# "teachingStyleBridgeBuilderAiHelp3": "AI translates CS ideas into contexts that match your students’ passions.",
# "teachingStyleStorytellerName": "The Storyteller",
# "teachingStyleStorytellerTagline": "You make algorithms feel like adventures",
# "teachingStyleStorytellerSuperpower1": "Narrative Master: You use stories, analogies, and themes to make complex concepts accessible",
# "teachingStyleStorytellerSuperpower2": "Memory Maker: Students remember your lessons through the vivid stories you tell",
# "teachingStyleStorytellerSuperpower3": "Abstract Translator: You make abstract concepts tangible and memorable through storytelling",
# "teachingStyleStorytellerAiHelp1": "AI helps you build analogies and classroom “plots” that turn coding into adventure.",
# "teachingStyleStorytellerAiHelp2": "AI generates sticky metaphors and hooks that help lessons last.",
# "teachingStyleStorytellerAiHelp3": "AI provides playful mini-stories that make the abstract tangible.",
# "teachingStyleCommunityArchitectName": "The Community Architect",
# "teachingStyleCommunityArchitectTagline": "You build collaborative coders, not just code",
# "teachingStyleCommunityArchitectSuperpower1": "Collaboration Champion: You focus on teamwork, code reviews, and peer learning experiences",
# "teachingStyleCommunityArchitectSuperpower2": "Inclusion Expert: You create inclusive spaces where every student contributes and belongs",
# "teachingStyleCommunityArchitectSuperpower3": "Team Builder: Your classroom feels more like a supportive dev team than a traditional class",
# "teachingStyleCommunityArchitectAiHelp1": "AI designs role-based activities that mirror real-world developer teamwork.",
# "teachingStyleCommunityArchitectAiHelp2": "AI tailors strategies to help quiet students contribute and belong.",
# "teachingStyleCommunityArchitectAiHelp3": "AI helps set up prompts for code reviews, daily developer check ins and group structures that build a supportive culture.",
# "teachingStyleLeadLearnerName": "The Lead Learner",
# "teachingStyleLeadLearnerTagline": "You learn alongside your students, turning every challenge into a shared adventure.",
# "teachingStyleLeadLearnerSuperpower1": "Co-Learner: You're comfortable not having all the answers, showing students that discovery, exploration, and even mistakes are part of the learning journey.",
# "teachingStyleLeadLearnerSuperpower2": "Curiosity Driver: You spark experimentation and model lifelong learning by exploring new tools and ideas alongside your students.",
# "teachingStyleLeadLearnerSuperpower3": "Growth Mindset Modeler: You build a classroom culture of teamwork and inclusion, where every student feels they belong.",
# "teachingStyleLeadLearnerAiHelp1": "AI models “thinking out loud” alongside you, normalizing exploration.",
# "teachingStyleLeadLearnerAiHelp2": "AI fuels curiosity with prompts that invite tinkering and exploration.",
# "teachingStyleLeadLearnerAiHelp3": "AI designs role-based activities that mirror real-world dev teamwork.",

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
