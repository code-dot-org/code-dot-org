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

  test "get_system_prompt returns formatted prompt with lesson data" do
    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id)

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

  # *****
  # get_lesson_materials tests
  # *****

  test "get_lesson_materials extracts basic lesson information" do
    materials = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(@lesson.id)

    assert_equal @lesson.name, materials[:name]
    assert_equal @lesson.overview, materials[:overview]
    assert_equal @lesson.purpose, materials[:purpose]
    assert_equal @lesson.assessment_opportunities, materials[:assessment_opportunities]
    assert_equal @lesson.preparation, materials[:preparation]
  end

  test "get_lesson_materials extracts objectives correctly" do
    materials = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(@lesson.id)

    assert_equal 2, materials[:objectives].length
    assert_includes materials[:objectives], @objective1.description
    assert_includes materials[:objectives], @objective2.description
  end

  test "get_lesson_materials extracts standards correctly" do
    materials = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(@lesson.id)

    assert_equal 2, materials[:standards].length
    assert_includes materials[:standards], @standard1.description
    assert_includes materials[:standards], @standard2.description
  end

  test "get_lesson_materials extracts opportunity standards correctly" do
    materials = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(@lesson.id)

    assert_equal 1, materials[:opportunity_standards].length
    assert_includes materials[:opportunity_standards], @opp_standard.description
  end

  test "get_lesson_materials extracts activities" do
    materials = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(@lesson.id)
    puts materials
    assert_equal 1, materials[:activities].length

    activity = materials[:activities].first
    assert_equal 'Variable Practice', activity[:name]
  end

  test "get_lesson_materials extracts vocabularies correctly" do
    materials = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(@lesson.id)

    assert_equal 2, materials[:vocabularies].length

    variable_vocab = materials[:vocabularies].find {|v| v[:word] == 'Variable'}
    assert_equal 'A container that stores data', variable_vocab[:definition]

    assignment_vocab = materials[:vocabularies].find {|v| v[:word] == 'Assignment'}
    assert_equal 'Setting a value to a variable', assignment_vocab[:definition]
  end
end
