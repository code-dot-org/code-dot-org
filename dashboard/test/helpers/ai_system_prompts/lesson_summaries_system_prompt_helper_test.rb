require 'test_helper'

class AiSystemPrompts::LessonSummariesSystemPromptHelperTest < ActionView::TestCase
  include AiSystemPrompts::LessonSummariesSystemPromptHelper

  setup do
    # Create test user
    @test_user = create(:teacher)

    # Create lesson with associated data
    @lesson = create(:lesson,
      name: 'Introduction to Variables',
      purpose: 'Students will understand basic variable concepts',
      preparation: 'Review previous coding concepts',
      assessment_opportunities: 'Observe student coding practices',
      overview: 'This lesson introduces students to programming variables.'
    )

    # Create objectives
    @objective1 = create(:objective, description: 'Define what a variable is')
    @objective2 = create(:objective, description: 'Create variables in code')
    @lesson.objectives << [@objective1, @objective2]

    # Create standards
    @standard1 = create(:standard, description: 'CS.K-2.Algorithms and Programming')
    @standard2 = create(:standard, description: 'CS.3-5.Data and Analysis')
    @lesson.standards << [@standard1, @standard2]

    # Create opportunity standards
    @opp_standard = create(:standard, description: 'CS.K-2.Computing Systems')
    @lesson.opportunity_standards << @opp_standard

    @vocab1 = create(:vocabulary, word: 'Variable', definition: 'A container that stores data')
    @vocab2 = create(:vocabulary, word: 'Assignment', definition: 'Setting a value to a variable')
    @lesson.vocabularies << [@vocab1, @vocab2]

    @activity = create(:lesson_activity, name: "Variable Practice")
    @lesson.lesson_activities << @activity
  end

  # *****
  # get_system_prompt tests
  # *****

  test "get_system_prompt returns prompt with lesson data in the brief summary format" do
    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])

    # Test that the prompt includes lesson basic information
    assert_includes prompt, "Lesson Name: #{@lesson.name}"
    assert_includes prompt, "Lesson Overview: #{@lesson.overview}"
    assert_includes prompt, "Lesson Purpose: #{@lesson.purpose}"
    assert_includes prompt, "Assessment Opportunities: #{@lesson.assessment_opportunities}"
    assert_includes prompt, "Preparation: #{@lesson.preparation}"

    # Test that objectives are included
    assert_includes prompt, "Learning Objectives:"
    assert_includes prompt, @objective1.description
    assert_includes prompt, @objective2.description

    # Test that standards are included
    assert_includes prompt, "Standards:"
    assert_includes prompt, @standard1.description
    assert_includes prompt, @standard2.description

    # Test that opportunity standards are included
    assert_includes prompt, "Opportunity Standards:"
    assert_includes prompt, @opp_standard.description

    # Test that activities are included
    assert_includes prompt, "Activities:"
    assert_includes prompt, @activity.name

    # Test that vocabularies are included
    assert_includes prompt, "Vocabulary:"
    assert_includes prompt, @vocab1.word
    assert_includes prompt, @vocab1.definition
    assert_includes prompt, "Your summary should be returned in JSON format and should be composed as follows:
    {learning_objective: this should be a brief, one paragraph summary of the lesson, focusing on each of the Learning Objectives and how they will be achieved,
    lesson_beats: an ordered list of the main parts of the lesson, including activities and new vocabulary terms,
    misconceptions: an unordered list including 2 - 3 misconceptions students might have about the material being covered,
    tips: additional strategies or ideas to help with teaching the lesson}"
  end

  test "get_system_prompt returns prompt with lesson data in the podcast transcript format" do
    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_TRANSCRIPT])

    # Test that the prompt includes lesson basic information
    assert_includes prompt, "Lesson Name: #{@lesson.name}"
    assert_includes prompt, "Lesson Overview: #{@lesson.overview}"
    assert_includes prompt, "Lesson Purpose: #{@lesson.purpose}"
    assert_includes prompt, "Assessment Opportunities: #{@lesson.assessment_opportunities}"
    assert_includes prompt, "Preparation: #{@lesson.preparation}"

    # Test that objectives are included
    assert_includes prompt, "Learning Objectives:"
    assert_includes prompt, @objective1.description
    assert_includes prompt, @objective2.description

    # Test that standards are included
    assert_includes prompt, "Standards:"
    assert_includes prompt, @standard1.description
    assert_includes prompt, @standard2.description

    # Test that opportunity standards are included
    assert_includes prompt, "Opportunity Standards:"
    assert_includes prompt, @opp_standard.description

    # Test that activities are included
    assert_includes prompt, "Activities:"
    assert_includes prompt, @activity.name

    # Test that vocabularies are included
    assert_includes prompt, "Vocabulary:"
    assert_includes prompt, @vocab1.word
    assert_includes prompt, @vocab1.definition
    assert_includes prompt, "Your summary should be the transcript of a podcast returned as a string. It should be written in the 2nd person directed at the listener and organized as follows:
    - First, start with the opening sentence: You're listening to AI Teaching Assistant's Daily Byte, your quick check-in before class
    - Second, give a one sentence overview that lists the lesson name and describes what its about
    - Third, in one to two paragraphs summarize the lesson's Learning Objectives, an overview of what the lesson entails, and describe the activities and new vocabulary terms
    - Fourth, in one to two paragraphs summarize some strategies and ideas about how they can structure the lesson as well as some misconceptions students may have about the material
    - Fifth, end with a closing remark that repeats the name of the lesson and thanks them for listening."
  end

  test "get_system_prompt includes personalization when current_user is set" do
    profile_data = {"yearsTeaching" => 10, "selectedConfidence" => 8}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    # Mock current_user for the helper
    AiSystemPrompts::LessonSummariesSystemPromptHelper.stubs(:current_user).returns(@test_user)

    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id)

    assert_includes prompt, "The teacher has 10 years of experience"
    assert_includes prompt, "confidence with computer science concepts at 8"
    assert_includes prompt, "Use the following lesson plan to generate your summary:"
  end

  test "get_system_prompt works without personalization when current_user is nil" do
    # Mock current_user as nil
    AiSystemPrompts::LessonSummariesSystemPromptHelper.stubs(:current_user).returns(nil)

    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id)

    # Should not include personalization content
    refute_includes prompt, "years of experience"
    refute_includes prompt, "confidence with computer science"
    # But should still include the main prompt content
    assert_includes prompt, "Use the following lesson plan to generate your summary:"
  end

  # *****
  # get_personalization tests
  # *****

  test "get_personalization returns nil when no profile exists" do
    non_existent_user_id = 999999
    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(non_existent_user_id)

    assert_nil result
  end

  test "get_personalization returns empty string when profile exists but has no data" do
    TeachingProfileData.create(user_id: @test_user.id, individual_data: {})

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_equal "", result
  end

  test "get_personalization includes years of teaching experience" do
    profile_data = {"yearsTeaching" => 10}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "The teacher has 10 years of experience in the classroom."
  end

  test "get_personalization includes confidence rating" do
    profile_data = {"selectedConfidence" => 7}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "They rate their confidence with computer science concepts at 7, with 10 being extremely confident, and 1 being not confident at all."
  end

  test "get_personalization includes teaching goals as bulleted list" do
    profile_data = {"selectedGoals" => ["Engage all students", "Build confidence", "Make CS accessible"]}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "They listed the following as their primary teaching goals:"
    assert_includes result, "  -Engage all students"
    assert_includes result, "  -Build confidence"
    assert_includes result, "  -Make CS accessible"
  end

  test "get_personalization includes requested supports as bulleted list" do
    profile_data = {"selectedSupports" => ["Lesson planning help", "Assessment ideas", "Differentiation strategies"]}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "They requested the following types of support from the assistant:"
    assert_includes result, "  -Lesson planning help"
    assert_includes result, "  -Assessment ideas"
    assert_includes result, "  -Differentiation strategies"
  end

  test "get_personalization includes biggest challenge" do
    profile_data = {"challenge" => "Getting students engaged with coding concepts"}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "They stated that their biggest challenge is: Getting students engaged with coding concepts"
  end

  test "get_personalization includes classroom vision" do
    profile_data = {"classroomVision" => "A collaborative space where every student feels empowered to create"}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "Their vision for their classroom is: A collaborative space where every student feels empowered to create"
  end

  test "get_personalization includes matched persona - The Innovator" do
    profile_data = {"matchedPersona" => "The Innovator"}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "They were matched with the following teaching persona as part of a personalization quiz:"
    assert_includes result, "Name: The Innovator"
    assert_includes result, "Tagline: Your classroom is where wild ideas come to life"
  end

  test "get_personalization includes matched persona - The Code Whisperer" do
    profile_data = {"matchedPersona" => "The Code Whisperer"}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "Name: The Code Whisperer"
    assert_includes result, "Tagline: You have an uncanny ability to debug student thinking"
  end

  test "get_personalization includes matched persona - The Bridge Builder" do
    profile_data = {"matchedPersona" => "The Bridge Builder"}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "Name: The Bridge Builder"
    assert_includes result, "You connect CS to everything students care about"
  end

  test "get_personalization includes matched persona - The Storyteller" do
    profile_data = {"matchedPersona" => "The Storyteller"}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "Name: The Storyteller"
    assert_includes result, "You make algorithms feel like adventures"
  end

  test "get_personalization includes matched persona - The Community Architect" do
    profile_data = {"matchedPersona" => "The Community Architect"}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "Name: The Community Architect"
    assert_includes result, "You build collaborative coders, not just code"
  end

  test "get_personalization includes matched persona - The Lead Learner" do
    profile_data = {"matchedPersona" => "The Lead Learner"}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    assert_includes result, "Name: The Lead Learner"
    assert_includes result, "You learn alongside your students"
  end

  test "get_personalization combines multiple profile elements correctly" do
    profile_data = {
      "yearsTeaching" => 5,
      "selectedConfidence" => 6,
      "selectedGoals" => ["Build student confidence", "Make CS fun"],
      "selectedSupports" => ["Project ideas", "Assessment help"],
      "challenge" => "Managing different skill levels",
      "classroomVision" => "An inclusive coding community",
      "matchedPersona" => "The Innovator"
    }
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    # Test that all elements are included
    assert_includes result, "5 years of experience"
    assert_includes result, "confidence with computer science concepts at 6"
    assert_includes result, "  -Build student confidence"
    assert_includes result, "  -Make CS fun"
    assert_includes result, "  -Project ideas"
    assert_includes result, "  -Assessment help"
    assert_includes result, "Managing different skill levels"
    assert_includes result, "An inclusive coding community"
    assert_includes result, "The Innovator"

    # Test that sections are properly ordered and formatted
    lines = result.split("\n")
    experience_line_index = lines.find_index {|line| line.include?("years of experience")}
    confidence_line_index = lines.find_index {|line| line.include?("confidence with computer science")}
    persona_line_index = lines.find_index {|line| line.include?("teaching persona")}

    # Verify ordering
    assert experience_line_index < confidence_line_index
    assert confidence_line_index < persona_line_index
  end

  test "get_personalization handles missing persona gracefully" do
    profile_data = {"matchedPersona" => "Unknown Persona"}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    # Should include the personalization text but persona should be nil
    assert_includes result, "They were matched with the following teaching persona as part of a personalization quiz:"
    # The persona content should be empty/nil since it's not a recognized persona
    persona_section = result.split("personalization quiz:\n")[1]
    assert persona_section.nil? || persona_section.strip.empty? || persona_section.strip == "\n"
  end

  test "get_personalization formats newlines correctly" do
    profile_data = {
      "yearsTeaching" => 2,
      "selectedConfidence" => 4
    }
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    result = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_personalization(@test_user.id)

    # Test that each piece of information starts on a new line
    lines = result.split("\n").reject(&:empty?)
    assert lines.length >= 2
    assert lines[0].include?("years of experience")
    assert lines[1].include?("confidence with computer science")
  end

  test "get_system_prompt includes personalization when current_user is set" do
    profile_data = {"yearsTeaching" => 10, "selectedConfidence" => 8}
    TeachingProfileData.create(user_id: @test_user.id, individual_data: profile_data)

    # Mock current_user for the helper
    AiSystemPrompts::LessonSummariesSystemPromptHelper.stubs(:current_user).returns(@test_user)

    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])

    assert_includes prompt, "The teacher has 10 years of experience"
    assert_includes prompt, "confidence with computer science concepts at 8"
    assert_includes prompt, "Use the following lesson plan to generate your summary:"
  end

  test "get_system_prompt works without personalization when current_user is nil" do
    # Mock current_user as nil
    AiSystemPrompts::LessonSummariesSystemPromptHelper.stubs(:current_user).returns(nil)

    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:BRIEF_SUMMARY])

    # Should not include personalization content
    refute_includes prompt, "years of experience"
    refute_includes prompt, "confidence with computer science"
    # But should still include the main prompt content
    assert_includes prompt, "Use the following lesson plan to generate your summary:"
  end
end
