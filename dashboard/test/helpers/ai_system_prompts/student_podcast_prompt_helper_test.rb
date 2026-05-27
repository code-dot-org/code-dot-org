require 'test_helper'

class AiSystemPrompts::StudentPodcastPromptHelperTest < ActionView::TestCase
  setup do
    @user = create(:teacher)
    @lesson = create(:lesson,
      name: 'Loops 101',
      purpose: 'Students will understand loops',
      preparation: 'Review variables',
      assessment_opportunities: 'Observe code',
      overview: 'A short intro to loops.'
    )

    I18n.stubs(:t).returns('fake unit description')

    @objective1 = create(:objective, description: 'Define a loop')
    @objective2 = create(:objective, description: 'Write a for loop')
    @objective_unused = create(:objective, description: 'Should not be in prompt')
    @lesson.objectives << [@objective1, @objective2, @objective_unused]

    @standard = create(:standard, description: 'CS.K-2.Algorithms')
    @lesson.standards << @standard

    @vocab = create(:vocabulary, word: 'Loop', definition: 'Repeated work')
    @lesson.vocabularies << @vocab

    @activity = create(:lesson_activity, name: 'Loop practice')
    @lesson.lesson_activities << @activity
  end

  # *****
  # get_openai_system_prompt
  # *****

  test 'get_openai_system_prompt includes lesson basics in the prompt' do
    prompt = AiSystemPrompts::StudentPodcastPromptHelper.
      get_openai_system_prompt(@lesson.id, [@objective1.id, @objective2.id], @user.id)

    assert_includes prompt, "Lesson Name: #{@lesson.name}"
    assert_includes prompt, "Lesson Overview: #{@lesson.overview}"
    assert_includes prompt, "Lesson Purpose: #{@lesson.purpose}"
    assert_includes prompt, "Assessment Opportunities: #{@lesson.assessment_opportunities}"
    assert_includes prompt, "Preparation: #{@lesson.preparation}"
    assert_includes prompt, 'Standards:'
    assert_includes prompt, @standard.description
    assert_includes prompt, 'Vocabulary:'
    assert_includes prompt, @vocab.word
    assert_includes prompt, 'Activities:'
    assert_includes prompt, @activity.name
  end

  test 'get_openai_system_prompt only includes the requested objective descriptions' do
    prompt = AiSystemPrompts::StudentPodcastPromptHelper.
      get_openai_system_prompt(@lesson.id, [@objective1.id], @user.id)

    assert_includes prompt, @objective1.description
    refute_includes prompt, @objective2.description
    refute_includes prompt, @objective_unused.description
  end

  test 'get_openai_system_prompt describes the script JSON envelope expected by OpenaiClient' do
    prompt = AiSystemPrompts::StudentPodcastPromptHelper.
      get_openai_system_prompt(@lesson.id, [@objective1.id], @user.id)

    assert_includes prompt, "'script' key"
    assert_includes prompt, "voice_id"
    assert_includes prompt, "text"
  end

  test 'get_openai_system_prompt works when user_id is nil' do
    assert_nothing_raised do
      AiSystemPrompts::StudentPodcastPromptHelper.
        get_openai_system_prompt(@lesson.id, [@objective1.id])
    end
  end

  # *****
  # get_lesson_materials
  # *****

  test 'get_lesson_materials filters objectives to the requested ids' do
    materials = AiSystemPrompts::StudentPodcastPromptHelper.
      get_lesson_materials(@lesson.id, [@objective1.id], @user.id)

    assert_equal [@objective1.description], materials[:objectives]
  end

  test 'get_lesson_materials looks up the user by user_id and tolerates an unknown id' do
    User.expects(:find_by).with(id: 999_999).returns(nil)

    assert_nothing_raised do
      AiSystemPrompts::StudentPodcastPromptHelper.
        get_lesson_materials(@lesson.id, [@objective1.id], 999_999)
    end
  end
end
