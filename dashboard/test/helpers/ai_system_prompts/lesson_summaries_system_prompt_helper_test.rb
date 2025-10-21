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
      assessment_opportunities: 'Observe student coding practices'
    )

    # Create objectives
    @objective1 = create(:objective, description: 'Define what a variable is')
    @objective2 = create(:objective, description: 'Create variables in code')
    @lesson.objectives << [@objective1, @objective2]

    # Create standards
    @standard1 = create(:standard, description: 'CS.K-2.Algorithms & Programming')
    @standard2 = create(:standard, description: 'CS.3-5.Data & Analysis')
    @lesson.standards << [@standard1, @standard2]

    # Create opportunity standards
    @opp_standard = create(:standard, description: 'CS.K-2.Computing Systems')
    @lesson.opportunity_standards << @opp_standard

    # Mock lesson materials structure that would be returned by summarize_for_lesson_show
    @mock_lesson_materials = {
      overview: 'This lesson introduces students to programming variables.',
      activities: [
        {
          name: 'Variable Practice',
          activitySections: [
            {
              description: 'Introduction to variables',
              scriptLevels: [
                {
                  levels: [
                    {
                      longInstructions: 'Create a variable called age and set it to 10',
                      containedLevels: [
                        {longInstructions: 'Now display your variable'}
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      vocabularies: [
        {word: 'Variable', definition: 'A container that stores data'},
        {word: 'Assignment', definition: 'Setting a value to a variable'}
      ]
    }

    # Stub the lesson.summarize_for_lesson_show method
    @lesson.stubs(:summarize_for_lesson_show).with(@test_user, true).returns(@mock_lesson_materials)
  end

  # *****
  # get_system_prompt tests
  # *****

  test "get_system_prompt returns formatted prompt with lesson data" do
    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id)

    # Test that the prompt includes lesson basic information
    assert_includes prompt, "Lesson Name: #{@lesson.name}"
    assert_includes prompt, "Lesson Overview: #{@mock_lesson_materials[:overview]}"
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

    # Test that vocabularies are included
    assert_includes prompt, "Vocabulary:"
  end

  test "get_system_prompt includes JSON format instructions" do
    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id)

    # Test that JSON format instructions are present
    assert_includes prompt, "Your summary should be returned in JSON format"
    assert_includes prompt, "learning_objective:"
    assert_includes prompt, "lesson_beats:"
    assert_includes prompt, "misconceptions:"
    assert_includes prompt, "tips:"

    # Test specific format requirements
    assert_includes prompt, "brief, one paragraph summary"
    assert_includes prompt, "ordered list of the main parts"
    assert_includes prompt, "2 - 3 misconceptions"
    assert_includes prompt, "additional strategies or ideas"
  end

  test "get_system_prompt handles lesson without optional fields gracefully" do
    # Create lesson without optional fields
    minimal_lesson = create(:lesson,
      name: 'Basic Lesson',
      purpose: nil,
      preparation: '',
      assessment_opportunities: nil
    )

    minimal_materials = {
      overview: 'Basic lesson overview',
      activities: [],
      vocabularies: []
    }

    minimal_lesson.stubs(:summarize_for_lesson_show).returns(minimal_materials)

    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(minimal_lesson.id)

    # Should still include basic structure
    assert_includes prompt, "Lesson Name: #{minimal_lesson.name}"
    assert_includes prompt, "Lesson Overview: #{minimal_materials[:overview]}"

    # Optional fields should not break the prompt
    refute_includes prompt, "Lesson Purpose: "
    refute_includes prompt, "Assessment Opportunities: "
  end

  # *****
  # get_lesson_materials tests
  # *****

  test "get_lesson_materials extracts basic lesson information" do
    materials = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(@lesson.id)

    assert_equal @lesson.name, materials[:name]
    assert_equal @mock_lesson_materials[:overview], materials[:overview]
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

  test "get_lesson_materials extracts activities with structure" do
    materials = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(@lesson.id)

    assert_equal 1, materials[:activities].length

    activity = materials[:activities].first
    assert_equal 'Variable Practice', activity[:name]
    assert_equal 1, activity[:sections].length

    section = activity[:sections].first
    assert_equal 'Introduction to variables', section[:description]
    assert_equal 2, section[:levels].length
    assert_includes section[:levels], 'Create a variable called age and set it to 10'
    assert_includes section[:levels], 'Now display your variable'
  end

  test "get_lesson_materials extracts vocabularies correctly" do
    materials = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(@lesson.id)

    assert_equal 2, materials[:vocabularies].length

    variable_vocab = materials[:vocabularies].find {|v| v[:word] == 'Variable'}
    assert_equal 'A container that stores data', variable_vocab[:definition]

    assignment_vocab = materials[:vocabularies].find {|v| v[:word] == 'Assignment'}
    assert_equal 'Setting a value to a variable', assignment_vocab[:definition]
  end

  test "get_lesson_materials handles empty collections gracefully" do
    # Create lesson with no associated data
    empty_lesson = create(:lesson, name: 'Empty Lesson')

    empty_materials = {
      overview: 'Empty lesson',
      activities: [],
      vocabularies: []
    }

    empty_lesson.stubs(:summarize_for_lesson_show).returns(empty_materials)

    materials = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(empty_lesson.id)

    # Should handle empty arrays gracefully
    assert_equal [], materials[:objectives]
    assert_equal [], materials[:standards]
    assert_equal [], materials[:opportunity_standards]
    assert_equal [], materials[:activities]
    assert_equal [], materials[:vocabularies]
  end

  test "get_lesson_materials uses correct teacher user for lesson materials" do
    # Test that it uses the specific teacher email
    @lesson.expects(:summarize_for_lesson_show).with(@test_user, true).returns(@mock_lesson_materials)

    AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(@lesson.id)
  end

  # *****
  # Integration tests
  # *****

  test "full integration: get_system_prompt calls get_lesson_materials and formats correctly" do
    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id)

    # Verify that the prompt contains formatted data from lesson materials
    assert_includes prompt, "Lesson Name: Introduction to Variables"
    assert_includes prompt, "Learning Objectives: [\"Define what a variable is\", \"Create variables in code\"]"
    assert_includes prompt, "Standards: [\"CS.K-2.Algorithms & Programming\", \"CS.3-5.Data & Analysis\"]"
    assert_includes prompt, "Vocabulary: [{:word=>\"Variable\", :definition=>\"A container that stores data\"}, {:word=>\"Assignment\", :definition=>\"Setting a value to a variable\"}]"

    # Verify JSON format instructions are included
    assert_includes prompt, "Your summary should be returned in JSON format"
  end

  test "system prompt format matches expected structure for AI consumption" do
    prompt = AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(@lesson.id)

    # Verify the prompt has clear sections for AI parsing
    lines = prompt.split("\n")

    # Should have a clear header
    assert lines.first.include?("Use the following lesson plan")

    # Should have labeled sections
    lesson_name_line = lines.find {|line| line.start_with?("Lesson Name:")}
    refute_nil lesson_name_line

    overview_line = lines.find {|line| line.start_with?("Lesson Overview:")}
    refute_nil overview_line

    # Should end with JSON format instructions
    assert_includes prompt, "learning_objective:"
    assert_includes prompt, "lesson_beats:"
    assert_includes prompt, "misconceptions:"
    assert_includes prompt, "tips:"
  end

  # *****
  # Error handling tests
  # *****

  test "get_lesson_materials handles non-existent lesson gracefully" do
    # This should raise an ActiveRecord::RecordNotFound exception
    assert_raises(ActiveRecord::RecordNotFound) do
      AiSystemPrompts::LessonSummariesSystemPromptHelper.get_lesson_materials(999999)
    end
  end

  test "get_system_prompt handles lesson materials errors gracefully" do
    # Mock lesson that raises an error during summarization
    error_lesson = create(:lesson, name: 'Error Lesson')
    error_lesson.stubs(:summarize_for_lesson_show).raises(StandardError, "Summarization failed")

    assert_raises(StandardError) do
      AiSystemPrompts::LessonSummariesSystemPromptHelper.get_system_prompt(error_lesson.id)
    end
  end
end
