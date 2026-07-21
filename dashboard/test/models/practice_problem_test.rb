require "test_helper"

class PracticeProblemTest < ActiveSupport::TestCase
  setup do
    @objective1 = create(:objective, key: 'obj-1')
    @objective2 = create(:objective, key: 'obj-2')
  end

  def practice_problem_data(overrides = {})
    {
      key: 'test-practice-problem',
      active: true,
      problem_type: 'multiple_choice_single_select',
      problem_text: 'Is blue a color?',
      solution: [
        {option: 'Yes', correct: true},
        {option: 'No', correct: false},
      ],
    }.merge(overrides)
  end

  test 'key uniqueness is validated' do
    create(:practice_problem, key: 'dup-key')
    dup = build(:practice_problem, key: 'dup-key')
    refute dup.valid?
    assert_includes dup.errors[:key], 'has already been taken'
  end

  test 'summarize_for_lesson_edit scopes objectiveIds to the given lesson' do
    lesson = create(:lesson)
    other_lesson = create(:lesson)
    lesson_objective = create(:objective, lesson: lesson)
    other_objective = create(:objective, lesson: other_lesson)
    problem = create(:practice_problem, problem_type: 'match')
    problem.objectives = [lesson_objective, other_objective]

    summary = problem.summarize_for_lesson_edit(lesson)

    assert_equal problem.id, summary[:id]
    assert_equal 'match', summary[:problemType]
    assert_equal [lesson_objective.id], summary[:objectiveIds]
  end

  test 'write_serialization writes a file readable by seed_record' do
    Dir.mktmpdir do |tmpdir|
      problem = create(
        :practice_problem,
        key: 'write-test',
        problem_type: 'multiple_choice_single_select',
        problem_text: 'Q?',
        solution: [{'option' => 'a', 'correct' => true}]
      )
      problem.objectives << @objective1

      Rails.application.config.stubs(:levelbuilder_mode).returns(true)
      problem.stubs(:file_path).returns(Pathname.new(tmpdir).join('write-test.json'))

      problem.write_serialization

      written = JSON.parse(File.read(problem.file_path))
      assert_equal 'write-test', written['key']
      assert_equal 'multiple_choice_single_select', written['problem_type']
      assert_equal 'Q?', written['problem_text']
      assert_equal [{'option' => 'a', 'correct' => true}], written['solution']
      assert_equal [@objective1.key], written['objective_keys']
    end
  end

  test 'seed_record creates a new practice problem' do
    File.stubs(:read).returns(practice_problem_data.to_json)

    key = PracticeProblem.seed_record('config/practice_problems/test-practice-problem.json')
    problem = PracticeProblem.find_by!(key: 'test-practice-problem')

    assert_equal 'test-practice-problem', key
    assert_equal true, problem.active
    assert_equal 'multiple_choice_single_select', problem.problem_type
    assert_equal 'Is blue a color?', problem.problem_text
    assert_equal [
      {"option" => 'Yes', "correct" => true},
      {"option" => 'No', "correct" => false},
    ], problem.solution
  end

  test 'seed_record updates an existing practice problem' do
    create(:practice_problem, key: 'test-practice-problem', problem_text: 'Old problem text')

    File.stubs(:read).returns(practice_problem_data(problem_text: 'New problem text').to_json)
    PracticeProblem.seed_record('config/practice_problems/test-practice-problem.json')

    assert_equal 'New problem text', PracticeProblem.find_by!(key: 'test-practice-problem').problem_text
  end

  test 'seed_record associates objectives via objective_keys' do
    data = practice_problem_data.merge(objective_keys: [@objective1.key, @objective2.key])
    File.stubs(:read).returns(data.to_json)

    PracticeProblem.seed_record('config/practice_problems/test-practice-problem.json')
    problem = PracticeProblem.find_by!(key: 'test-practice-problem')

    assert_equal 2, problem.objectives.count
    assert_includes problem.objectives, @objective1
    assert_includes problem.objectives, @objective2
  end

  test 'seed_record clears objectives when objective_keys is empty' do
    problem = create(:practice_problem, key: 'test-practice-problem')
    problem.objectives << @objective1

    File.stubs(:read).returns(practice_problem_data.merge(objective_keys: []).to_json)
    PracticeProblem.seed_record('config/practice_problems/test-practice-problem.json')

    assert_equal 0, problem.reload.objectives.count
  end

  test 'seed_record clears objectives when objective_keys is absent from file' do
    problem = create(:practice_problem, key: 'test-practice-problem')
    problem.objectives << @objective1

    File.stubs(:read).returns(practice_problem_data.to_json)
    PracticeProblem.seed_record('config/practice_problems/test-practice-problem.json')

    assert_equal 0, problem.reload.objectives.count
  end

  test 'seed_all skips bad files and continues seeding remaining files' do
    Dir.mktmpdir do |tmpdir|
      root = Pathname.new(tmpdir)
      File.write(root.join('bad.json'), 'not valid json {{')
      File.write(root.join('good.json'), practice_problem_data.to_json)

      assert_nothing_raised do
        PracticeProblem.seed_all(root_dir: root, glob: '*.json')
      end

      assert PracticeProblem.exists?(key: 'test-practice-problem'), 'valid file should still be seeded after bad file'
    end
  end
end
