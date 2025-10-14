module OpenaiPersonalizationHelper
  # NEED TO CHANGE THIS KEY
  API_KEY = CDO.openai_measures_of_learning_api_key
  MODEL = SharedConstants::PERSONALIZATION_MODEL_VERSION

  def self.match_teaching_profile(teaching_profile_data)
    if Rails.env.test?
      dummy_response = {
        "matchingProfile" => "The Lead Learner",
        "reasoning" => "Based on the responses, this teacher demonstrates key characteristics of a Lead Learner profile."
      }
      json_response = {"content" => dummy_response.to_json}
      return {status: :ok, json: json_response}
    end

    system_prompt = create_teaching_profile_system_prompt

    user_message = format_teaching_profile_data(teaching_profile_data)

    messages = prepend_system_prompt(system_prompt, [{role: "user", content: user_message}])

    begin
      response = client.request_evaluation(messages)
      response_body = JSON.parse(response.body)
      response_body = response_body['choices'][0]['message'] if response.code == 200
      return {status: response.code, json: response_body}
    rescue => exception
      Rails.logger.error "Teaching profile matching failed: #{exception.message}"
      return {status: :internal_server_error, json: {error: "Failed to match teaching profile"}}
    end
  end

  def self.create_teaching_profile_system_prompt
    profiles = [
      {
        name: "The Innovator",
        tagline: "You embrace new tools and creative approaches, constantly experimenting to enhance learning.",
        superpowers: [
          "Tech Trailblazer: You're eager to integrate new technologies and find creative ways to enhance learning through digital tools.",
          "Creative Problem-Solver: You approach challenges with fresh perspectives, turning obstacles into opportunities for innovation.",
          "Future-Focused: You prepare students for tomorrow's world by incorporating cutting-edge tools and forward-thinking approaches."
        ]
      },
      {
        name: "The Code Whisperer",
        tagline: "You have a deep understanding of programming concepts and love diving into the technical details.",
        superpowers: [
          "Technical Expert: You have strong programming knowledge and enjoy exploring the deeper aspects of computer science.",
          "Debug Detective: You excel at troubleshooting code issues and helping students understand what went wrong and why.",
          "Concept Clarifier: You break down complex programming concepts into understandable pieces, making the technical accessible."
        ]
      },
      {
        name: "The Bridge Builder",
        tagline: "You excel at connecting computer science to other subjects and real-world applications.",
        superpowers: [
          "Connection Creator: You naturally link CS concepts to other subjects, helping students see interdisciplinary relationships.",
          "Real-World Relevance: You consistently show students how programming applies to their interests and future careers.",
          "Context Champion: You provide meaningful contexts that make abstract concepts concrete and relatable."
        ]
      },
      {
        name: "The Storyteller",
        tagline: "You use narrative, examples, and engaging content to make learning memorable and meaningful.",
        superpowers: [
          "Narrative Navigator: You weave stories and scenarios into lessons, making abstract concepts memorable through narrative.",
          "Example Expert: You create compelling analogies and examples that help students grasp difficult concepts.",
          "Engagement Engineer: You design learning experiences that captivate student attention and spark curiosity."
        ]
      },
      {
        name: "The Community Architect",
        tagline: "You build strong classroom communities where collaboration and peer learning thrive.",
        superpowers: [
          "Collaboration Catalyst: You create opportunities for meaningful peer interaction and group problem-solving.",
          "Culture Builder: You establish classroom norms and practices that foster mutual respect and shared learning.",
          "Team Leader: You facilitate productive group work and help students learn from each other."
        ]
      },
      {
        name: "The Lead Learner",
        tagline: "You learn alongside your students, turning every challenge into a shared adventure.",
        superpowers: [
          "Co-Learner: You're comfortable not having all the answers, showing students that discovery and exploration are part of learning.",
          "Curiosity Driver: You spark experimentation and model lifelong learning by exploring new tools and ideas alongside students.",
          "Growth Mindset Modeler: You demonstrate that challenges are opportunities to learn and grow."
        ]
      }
    ]

    profiles_text = profiles.map do |profile|
      superpowers_text = profile[:superpowers].map {|s| "  - #{s}"}.join("\n")
      "**#{profile[:name]}**\n#{profile[:tagline]}\nSuperpowers:\n#{superpowers_text}"
    end.join("\n\n")

    <<~PROMPT
      You are an expert in analyzing teaching styles and personalities. Based on a teacher's responses to personalization questions, determine which teaching profile best matches their approach.

      Here are the 6 teaching profiles:

      #{profiles_text}

      Instructions:
      1. Analyze the teacher's responses to understand their teaching approach, goals, and preferences
      2. Match them to the teaching profile that best aligns with their characteristics
      3. Respond in JSON format with exactly these fields:
         - "matchingProfile": the exact name of the best matching profile (e.g., "The Lead Learner")
         - "reasoning": a brief explanation of why this profile matches (2-3 sentences)

      Focus on the teacher's goals, support preferences, classroom vision, confidence level, and how they approach challenges.
    PROMPT
  end

  def self.format_teaching_profile_data(data)
    formatted_parts = []

    if data['selectedGoals']
      formatted_parts << "Teaching Goals: #{data['selectedGoals'].join(', ')}"
    end

    if data['otherGoalText'].present?
      formatted_parts << "Other Teaching Goal: #{data['otherGoalText']}"
    end

    if data['selectedSupports']
      formatted_parts << "Preferred Support Types: #{data['selectedSupports'].join(', ')}"
    end

    if data['otherSupportText'].present?
      formatted_parts << "Other Support Preference: #{data['otherSupportText']}"
    end

    if data['selectedConfidence']
      formatted_parts << "Confidence Level in Teaching Programming: #{data['selectedConfidence']}/5"
    end

    if data['yearsTeaching']
      formatted_parts << "Years Teaching: #{data['yearsTeaching']}"
    end

    if data['classroomVision'].present?
      formatted_parts << "Classroom Vision: #{data['classroomVision']}"
    end

    if data['challenge'].present?
      formatted_parts << "Biggest Challenge: #{data['challenge']}"
    end

    formatted_parts.join("\n\n")
  end

  def self.client
    PersonalizationOpenaiHelper::Client.new(API_KEY, MODEL)
  end

  def self.prepend_system_prompt(system_prompt, messages)
    system_prompt_message = {
      content: system_prompt,
      role: "system"
    }

    messages.unshift(system_prompt_message)
    messages
  end

  private_class_method :client, :prepend_system_prompt
end
