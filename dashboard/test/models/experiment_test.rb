require 'test_helper'

class ExperimentTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  setup_all do
    @teacher = create :teacher
    @section = create :section, first_activity_at: DateTime.now, teacher: @teacher
    @student = create :student
    create :follower, section: @section, student_user: @student
    @script = create :script
  end

  test "no experiments" do
    assert_empty Experiment.get_all_enabled(user: @teacher)
  end

  test "user based experiment at 0 percent is not enabled" do
    experiment = create :user_based_experiment, percentage: 0
    assert_empty Experiment.get_all_enabled(user: @teacher)
    refute Experiment.enabled?(user: @teacher, experiment_name: experiment.name)
  end

  test "user based experiment at 100 percent is enabled" do
    experiment = create :user_based_experiment, percentage: 100
    assert_equal [experiment], Experiment.get_all_enabled(user: @teacher)
    assert Experiment.enabled?(user: @teacher, experiment_name: experiment.name)
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

  test "creating teacher based experiment without script raises" do
    assert_raises ActiveRecord::RecordInvalid do
      create :teacher_based_experiment, script: nil
    end
  end

  test "teacher based experiment at 0 percent is not enabled for matching script" do
    experiment = create :teacher_based_experiment, percentage: 0, script: @script
    teacher = build :teacher
    assert_empty Experiment.get_all_enabled(user: teacher, script: @script)
    refute Experiment.enabled?(experiment_name: experiment.name, user: teacher, script: @script)
  end

  test "teacher based experiment at 100 percent is enabled for matching script" do
    experiment = create :teacher_based_experiment, percentage: 100, script: @script
    assert_equal [experiment], Experiment.get_all_enabled(user: @teacher, script: @script)
    assert Experiment.enabled?(experiment_name: experiment.name, user: @teacher, script: @script)
  end

  test "teacher based experiment at 100 percent is not enabled for nil script" do
    experiment = create :teacher_based_experiment, percentage: 100, script: @script
    assert_equal [], Experiment.get_all_enabled(user: @teacher)
    refute Experiment.enabled?(experiment_name: experiment.name, user: @teacher)
  end

  test "teacher based experiment at 50 percent is enabled for only some users" do
    experiment = create :teacher_based_experiment, percentage: 50, script: @script
    student_on = create :student
    teacher_on = create :teacher, id: 1025 + experiment.min_user_id
    section_on = create :section, teacher: teacher_on
    create :follower, section: section_on, student_user: student_on

    student_off = create :student
    teacher_off = create :teacher, id: 1075 + experiment.min_user_id
    section_off = create :section, teacher: teacher_off
    create :follower, section: section_off, student_user: student_off

    assert_equal [experiment], Experiment.get_all_enabled(user: student_on, script: @script)
    assert Experiment.enabled?(experiment_name: experiment.name, user: student_on, script: @script)
    assert_empty Experiment.get_all_enabled(user: student_off, script: @script)
    refute Experiment.enabled?(experiment_name: experiment.name, user: student_off, script: @script)
  end

  test "teacher based experiment is disabled if start time is too late" do
    experiment = create :teacher_based_experiment,
      percentage: 100,
      earliest_section_at: DateTime.now + 1.day,
      script: @script
    assert_empty Experiment.get_all_enabled(user: @teacher)
    refute Experiment.enabled?(experiment_name: experiment.name, user: @teacher, script: @script)
  end

  test "teacher based experiment is disabled if end_time is too early" do
    experiment = create :teacher_based_experiment,
      percentage: 100,
      latest_section_at: DateTime.now - 1.day,
      script: @script
    assert_empty Experiment.get_all_enabled
    refute Experiment.enabled?(experiment_name: experiment.name)
  end

  test "teacher based experiment is disabled if other script assigned" do
    experiment = create :teacher_based_experiment,
      percentage: 100,
      script: create(:script)
    assert_empty Experiment.get_all_enabled(script: @script)
    refute Experiment.enabled?(script: @script, experiment_name: experiment.name)
  end

  test "teacher based experiment enabled for sections inside time bounds" do
    experiment = create :teacher_based_experiment,
      percentage: 100,
      earliest_section_at: DateTime.now - 1.day,
      latest_section_at: DateTime.now + 1.day,
      script: @script
    assert_equal [experiment], Experiment.get_all_enabled(user: @teacher, script: @script)
    assert Experiment.enabled?(user: @teacher, script: @script, experiment_name: experiment.name)
  end

  test "teacher based experiment disabled for sections outside time bounds" do
    experiment = create :teacher_based_experiment,
      percentage: 100,
      earliest_section_at: DateTime.now - 3.days,
      latest_section_at: DateTime.now - 1.day,
      script: @script
    assert_empty Experiment.get_all_enabled(user: @teacher, script: @script)
    refute Experiment.enabled?(user: @teacher, script: @script, experiment_name: experiment.name)
  end

  test "teacher is in the same teacher-based experiment as their section" do
    experiment1 = create :teacher_based_experiment,
      min_user_id: 0,
      max_user_id: 50,
      script: @script
    experiment2 = create :teacher_based_experiment,
      min_user_id: 50,
      max_user_id: 100,
      script: @script

    teacher = mock('teacher')
    teacher.stubs(:id).returns(1125)
    teacher.stubs(:teacher?).returns(true)
    student = mock('student')
    student.stubs(:id).returns(1175)
    student.stubs(:teacher?).returns(false)
    section = mock('section')
    section.stubs(:user_id).returns(teacher.id)
    student.stubs(:sections_as_student).returns([section])
    teacher.stubs(:sections_instructed).returns([section])

    assert Experiment.enabled?(experiment_name: experiment1.name, user: teacher, script: @script)
    assert Experiment.enabled?(experiment_name: experiment1.name, user: student, script: @script)

    refute Experiment.enabled?(experiment_name: experiment2.name, user: teacher, script: @script)
    refute Experiment.enabled?(experiment_name: experiment2.name, user: student, script: @script)
  end

  test "creating single section experiment without script raises" do
    assert_raises ActiveRecord::RecordInvalid do
      create :single_section_experiment, script: nil
    end
  end

  test "single section experiment is enabled with matching script" do
    experiment = create :single_section_experiment,
      section_id: @section.id,
      script: @script
    assert_equal [experiment], Experiment.get_all_enabled(user: @teacher, script: @script)
    assert Experiment.enabled?(experiment_name: experiment.name, user: @teacher, script: @script)
    assert_equal [experiment], Experiment.get_all_enabled(user: @student, script: @script)
    assert Experiment.enabled?(experiment_name: experiment.name, user: @student, script: @script)
  end

  test "single section experiment is disabled for nil script" do
    experiment = create :single_section_experiment,
                        section_id: @section.id,
                        script: @script
    assert_empty Experiment.get_all_enabled(user: @teacher)
    refute Experiment.enabled?(experiment_name: experiment.name, user: @teacher)
    assert_empty Experiment.get_all_enabled(user: @student)
    refute Experiment.enabled?(experiment_name: experiment.name, user: @student)
  end

  test "single section experiment is not enabled without matching section" do
    experiment = create :single_section_experiment, script: @script
    assert_empty Experiment.get_all_enabled(user: @teacher, script: @script)
    refute Experiment.enabled?(experiment_name: experiment.name, script: @script)
    assert_empty Experiment.get_all_enabled(user: @student, script: @script)
    refute Experiment.enabled?(experiment_name: experiment.name, user: @student, script: @script)
  end

  test "creating experiments does not break get_all_enabled for signed out user" do
    Harness.stubs(:error_notify).raises('HoneyBadger.notify called')
    create :user_based_experiment
    create :teacher_based_experiment
    create :single_user_experiment
    create :single_section_experiment
    Experiment.get_all_enabled
  end

  test "teacher is included in single-section experiment" do
    experiment = create :single_section_experiment, script: @script
    assert Experiment.enabled?(experiment_name: experiment.name, user: experiment.section.user, script: @script)
  end

  test 'can only create up to max_count single section experiments' do
    SingleSectionExperiment.any_instance.stubs(:max_count).returns(3)

    3.times do
      create :single_section_experiment
    end

    # creating a 4th experiment should fail
    assert_raises ActiveRecord::RecordInvalid do
      create :single_section_experiment
    end

    # once record limit is reached, can still update a record
    SingleSectionExperiment.last.update!(name: 'new-name')
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
    platformization_partner = create :platformization_partner
    levelbuilder = create :levelbuilder

    assert_nil Experiment.get_editor_experiment(teacher)
    assert_equal 'platformization-partners', Experiment.get_editor_experiment(platformization_partner)
    assert_nil Experiment.get_editor_experiment(levelbuilder)
  end
end
