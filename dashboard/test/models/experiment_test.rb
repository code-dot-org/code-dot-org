require 'test_helper'

class ExperimentTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @user = create :user
    @section = create :section, first_activity_at: DateTime.now
    @script = create :script
  end

  test "no experiments" do
    assert_empty Experiment.get_all_enabled(user: @user, section: @section)
  end

  test "user based experiment at 0 percent is not enabled" do
    experiment = create :user_based_experiment, percentage: 0
    assert_empty Experiment.get_all_enabled(user: @user)
    refute Experiment.enabled?(user: @user, experiment_name: experiment.name)
  end

  test "user based experiment at 100 percent is enabled" do
    experiment = create :user_based_experiment, percentage: 100
    assert_equal [experiment], Experiment.get_all_enabled(user: @user)
    assert Experiment.enabled?(user: @user, experiment_name: experiment.name)
  end

  test "user based experiment at 50 percent is enabled for only some users" do
    experiment = create :user_based_experiment, percentage: 50
    user_on = build :user, id: 1025 + experiment.min_user_id
    user_off = build :user, id: 1075 + experiment.min_user_id

    assert_equal [experiment], Experiment.get_all_enabled(user: user_on)
    assert Experiment.enabled?(user: user_on, experiment_name: experiment.name)
    assert_empty Experiment.get_all_enabled(user: user_off)
    refute Experiment.enabled?(user: user_off, experiment_name: experiment.name)
  end

  test "teacher based experiment at 0 percent is not enabled" do
    experiment = create :teacher_based_experiment, percentage: 0
    assert_empty Experiment.get_all_enabled(section: @section)
    refute Experiment.enabled?(section: @section, experiment_name: experiment.name)
  end

  test "teacher based experiment at 100 percent is enabled" do
    experiment = create :teacher_based_experiment, percentage: 100
    assert_equal [experiment], Experiment.get_all_enabled(section: @section)
    assert Experiment.enabled?(section: @section, experiment_name: experiment.name)
  end

  test "teacher based experiment at 50 percent is enabled for only some users" do
    experiment = create :teacher_based_experiment, percentage: 50
    section_on = build :section, user_id: 1025 + experiment.min_user_id
    section_off = build :section, user_id: 1075 + experiment.min_user_id

    assert_equal [experiment], Experiment.get_all_enabled(section: section_on)
    assert Experiment.enabled?(section: section_on, experiment_name: experiment.name)
    assert_empty Experiment.get_all_enabled(section: section_off)
    refute Experiment.enabled?(section: section_off, experiment_name: experiment.name)
  end

  test "teacher based experiment is disabled if start time is too late" do
    experiment = create :teacher_based_experiment,
      percentage: 100,
      earliest_section_at: DateTime.now + 1.day
    assert_empty Experiment.get_all_enabled(section: @section)
    refute Experiment.enabled?(section: @section, experiment_name: experiment.name)
  end

  test "teacher based experiment is disabled if end_time is too early" do
    experiment = create :teacher_based_experiment,
      percentage: 100,
      latest_section_at: DateTime.now - 1.day
    assert_empty Experiment.get_all_enabled(section: @section)
    refute Experiment.enabled?(section: @section, experiment_name: experiment.name)
  end

  test "teacher based experiment is disabled if other script assigned" do
    experiment = create :teacher_based_experiment,
      percentage: 100,
      script_id: @script.id + 1
    assert_empty Experiment.get_all_enabled(section: @section, script: @script)
    refute Experiment.enabled?(section: @section, script: @script, experiment_name: experiment.name)
  end

  test "teacher based experiment handles nil section start at" do
    experiment = create :teacher_based_experiment,
      percentage: 100,
      earliest_section_at: DateTime.now - 1.day,
      latest_section_at: DateTime.now + 1.day,
      script_id: @script.id + 1
    section = create :section
    assert_empty Experiment.get_all_enabled(section: section, script: @script)
    refute Experiment.enabled?(section: section, script: @script, experiment_name: experiment.name)
  end

  test "teacher based experiment is enabled if same script assigned" do
    experiment = create :teacher_based_experiment,
      percentage: 100,
      script_id: @script.id
    assert_equal [experiment], Experiment.get_all_enabled(section: @section, script: @script)
    assert Experiment.enabled?(section: @section, script: @script, experiment_name: experiment.name)
  end

  test "teacher is in the same teacher-based experiment as their section" do
    experiment1 = create :teacher_based_experiment,
      min_user_id: 0,
      max_user_id: 50
    experiment2 = create :teacher_based_experiment,
      min_user_id: 50,
      max_user_id: 100

    teacher = mock('teacher')
    teacher.stubs(:id).returns(1125)
    teacher.stubs(:teacher?).returns(true)
    student = mock('student')
    student.stubs(:id).returns(1175)
    section = mock('section')
    section.stubs(:user_id).returns(teacher.id)
    teacher.stubs(:sections).returns([section])

    assert Experiment.enabled?(experiment_name: experiment1.name, user: teacher)
    assert Experiment.enabled?(experiment_name: experiment1.name, user: student, section: section)

    refute Experiment.enabled?(experiment_name: experiment2.name, user: teacher)
    refute Experiment.enabled?(experiment_name: experiment2.name, user: student, section: section)
  end

  test "single section experiment is enabled" do
    experiment = create :single_section_experiment,
      section_id: @section.id
    assert_equal [experiment], Experiment.get_all_enabled(section: @section)
    assert Experiment.enabled?(section: @section, experiment_name: experiment.name)
    experiment.destroy
  end

  test "single section experiment is not enabled" do
    experiment = create :single_section_experiment
    assert_empty Experiment.get_all_enabled(section: @section)
    refute Experiment.enabled?(section: @section, experiment_name: experiment.name)
    experiment.destroy
  end

  test "teacher is included in single-section experiment" do
    experiment = create :single_section_experiment
    assert Experiment.enabled?(experiment_name: experiment.name, user: experiment.section.user)
    experiment.destroy
  end

  test 'single user experiment is enabled' do
    facilitator_yes = User.first || create(:facilitator)
    facilitator_no = User.second || create(:facilitator)
    experiment = SingleUserExperiment.first || create(:single_user_experiment, min_user_id: facilitator_yes.id)

    assert_equal [experiment], Experiment.get_all_enabled(user: facilitator_yes)
    assert_empty Experiment.get_all_enabled(user: facilitator_no)
    assert experiment.enabled?(user: facilitator_yes)
    refute experiment.enabled?(user: facilitator_no)
  end

  test 'experiment cache contains only active experiments' do
    now = DateTime.now
    active_experiments = [
      create(:single_user_experiment),
      create(:single_user_experiment, end_at: now + 1.day),
      create(:single_user_experiment, start_at: now - 1.day),
      create(:single_user_experiment, start_at: now - 1.day, end_at: now + 1.day),
    ]
    create(:single_user_experiment, end_at: now - 1.day)
    create(:single_user_experiment, start_at: now + 1.day)

    assert_equal active_experiments, Experiment.experiments
  end

  test 'editor experiments' do
    teacher = create :teacher
    wizard = create :teacher
    SingleUserExperiment.find_or_create_by!(min_user_id: wizard.id, name: 'hogwarts')
    levelbuilder = create :levelbuilder

    assert_nil Experiment.get_editor_experiment(teacher)
    assert_equal 'hogwarts', Experiment.get_editor_experiment(wizard)
    assert_nil Experiment.get_editor_experiment(levelbuilder)
  end
end
