require 'test_helper'

class PracticeProblemGeneratorTest < ActiveSupport::TestCase
  setup do
    @lesson = create(:lesson)
    @objective = create(:objective, lesson: @lesson, description: 'Understand loops')
  end

  def openai_response(problems)
    body = {
      choices: [{message: {content: {problems: problems}.to_json}}],
    }.to_json
    response = mock('response')
    response.stubs(:code).returns(200)
    response.stubs(:body).returns(body)
    response
  end

  def stub_openai(problems)
    client = mock('client')
    client.expects(:request_completion).returns(openai_response(problems))
    PracticeProblemGenerator::Client.expects(:new).returns(client)
  end

  test 'coerces multiple-choice correctness from strings to booleans' do
    stub_openai(
      [
        {
          type: 'multiple_choice_single_select',
          problem_text: 'Which is a loop?',
          objective_ids: [@objective.id],
          solution: [
            {option: 'for', correct: 'true'},
            {option: 'if', correct: 'false'},
          ],
        },
      ]
    )

    result = PracticeProblemGenerator.generate(lesson: @lesson)

    assert_equal 1, result.length
    problem = result.first
    assert_equal 'multiple_choice_single_select', problem[:problemType]
    assert_equal [
      {'option' => 'for', 'correct' => true},
      {'option' => 'if', 'correct' => false},
    ], problem[:solution]
    assert_equal [@objective.id], problem[:objectiveIds]
  end

  test 'coerces scramble positions to integers' do
    stub_openai(
      [
        {
          type: 'scramble',
          problem_text: 'Order the steps',
          objective_ids: [],
          solution: [
            {option: 'a', correct: '0'},
            {option: 'b', correct: '1'},
          ],
        },
      ]
    )

    result = PracticeProblemGenerator.generate(lesson: @lesson)
    assert_equal [
      {'option' => 'a', 'correct' => 0},
      {'option' => 'b', 'correct' => 1},
    ], result.first[:solution]
  end

  test 'filters objective ids to the lesson and drops duplicates of existing problems' do
    existing = create(:practice_problem, problem_text: 'Existing question', problem_type: 'match')
    existing.objectives << @objective

    stub_openai(
      [
        {
          type: 'match',
          problem_text: '  existing QUESTION ',
          objective_ids: [@objective.id],
          solution: [{option: 'a', correct: 'b'}],
        },
        {
          type: 'match',
          problem_text: 'A fresh question',
          objective_ids: [@objective.id, 999_999],
          solution: [{option: 'a', correct: 'b'}],
        },
      ]
    )

    result = PracticeProblemGenerator.generate(lesson: @lesson)

    assert_equal ['A fresh question'], result.map {|p| p[:problemText]}
    assert_equal [@objective.id], result.first[:objectiveIds]
  end

  test 'drops problems with unknown types or empty solutions' do
    stub_openai(
      [
        {type: 'not_a_type', problem_text: 'x', objective_ids: [], solution: [{option: 'a', correct: true}]},
        {type: 'match', problem_text: 'no solution', objective_ids: [], solution: []},
        {type: 'sort', problem_text: 'Good one', objective_ids: [], solution: [{option: 'a', correct: 'cat'}]},
      ]
    )

    result = PracticeProblemGenerator.generate(lesson: @lesson)
    assert_equal ['Good one'], result.map {|p| p[:problemText]}
  end

  test 'is resilient to malformed model output' do
    stub_openai(
      [
        'not even a hash',
        {
          type: 'multiple_choice_single_select',
          problem_text: 'Salvageable',
          objective_ids: [],
          # array-pair solution entries instead of objects, plus a junk entry
          solution: [['for', true], ['if', 'false'], 'garbage'],
        },
      ]
    )

    result = PracticeProblemGenerator.generate(lesson: @lesson)

    assert_equal ['Salvageable'], result.map {|p| p[:problemText]}
    assert_equal [
      {'option' => 'for', 'correct' => true},
      {'option' => 'if', 'correct' => false},
    ], result.first[:solution]
  end

  test 'raises OpenaiError on a non-200 response' do
    client = mock('client')
    response = mock('response')
    response.stubs(:code).returns(500)
    response.stubs(:body).returns('server error')
    client.expects(:request_completion).returns(response)
    PracticeProblemGenerator::Client.expects(:new).returns(client)

    assert_raises(PracticeProblemGenerator::OpenaiError) do
      PracticeProblemGenerator.generate(lesson: @lesson)
    end
  end
end
