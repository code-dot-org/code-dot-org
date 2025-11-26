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

    # Stub I18n to return fake localized_description for the Unit
    @fake_unit_description = 'Fake description for Unit'
    I18n.stubs(:t).returns(@fake_unit_description)

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

  test "get_system_prompt returns prompt with lesson data in the podcast script format" do
    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id, nil, AiSystemPrompts::LessonSummariesSystemPromptHelper::RESPONSE_FORMATS[:PODCAST_SCRIPT])

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

    # Test that unit overview is included
    assert_includes prompt, "Unit overview:"
    assert_includes prompt, @fake_unit_description

    assert_includes prompt, "Your summary should be the script of a podcast returned as a string. It should be written in the 2nd person directed at the listener and organized as follows:
    - First, start with the opening sentence: You're listening to AI Teaching Assistant's Daily Byte, your quick check-in before class
    - Second, give a one sentence overview that lists the lesson name and describes what its about
    - Third, describe what materials are needed for the lesson
    - Fourth, summarize the lesson's Learning Objectives, give an overview of what the lesson entails, describe the activities and new vocabulary terms, and describe how this lesson connects to the Goals and Big Questions in the Unit Overview
    - Fifth, provide step by step instructions using the Teacher Tips and Misconceptions in the lesson plan to show the teacher how to run the lesson
    - Sixth, end with a closing remark that repeats the name of the lesson and thanks them for listening."
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
end
