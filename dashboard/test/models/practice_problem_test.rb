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
