require 'test_helper'

class ExperimentTest < ActiveSupport::TestCase
  setup do
    Experiment.stubs(:should_cache?).returns false
  end

  test "no experiments" do
    assert_empty Experiment.get_all_enabled(user: create(:user), section: create(:section))
  end

  test "user based experiment at 0 percent is not enabled" do
    create :user_based_experiment, percentage: 0
    assert_empty Experiment.get_all_enabled(user: create(:user))
  end

  test "user based experiment at 100 percent is enabled" do
    experiment = create :user_based_experiment, percentage: 100
    assert_equal [experiment], Experiment.get_all_enabled(user: create(:user))
  end

  test "user based experiment at 50 percent is enabled for only some users" do
    experiment = create :user_based_experiment, percentage: 50
    user_on = build :user, id: 1025 + experiment.min_user_id
    user_off = build :user, id: 1075 + experiment.min_user_id

    assert_equal [experiment], Experiment.get_all_enabled(user: user_on)
    assert_empty Experiment.get_all_enabled(user: user_off)
  end

  test "teacher based experiment at 0 percent is not enabled" do
    create :teacher_based_experiment, percentage: 0
    assert_empty Experiment.get_all_enabled(section: create(:section))
  end

  test "teacher based experiment at 100 percent is enabled" do
    experiment = create :teacher_based_experiment, percentage: 100
    assert_equal [experiment], Experiment.get_all_enabled(section: create(:section))
  end

  test "teacher based experiment at 50 percent is enabled for only some users" do
    experiment = create :teacher_based_experiment, percentage: 50
    section_on = build :section, user_id: 1025 + experiment.min_user_id
    section_off = build :section, user_id: 1075 + experiment.min_user_id

    assert_equal [experiment], Experiment.get_all_enabled(section: section_on)
    assert_empty Experiment.get_all_enabled(section: section_off)
  end

  test "teacher based experiment is disabled if start time is too late" do
    create :teacher_based_experiment,
      percentage: 100,
      earliest_section_at: DateTime.now + 1.day
    section = create :section,
      first_activity_at: DateTime.now
    assert_empty Experiment.get_all_enabled(section: section)
  end

  test "teacher based experiment is disabled if end_time is too early" do
    create :teacher_based_experiment,
      percentage: 100,
      latest_section_at: DateTime.now - 1.day
    section = create :section,
      first_activity_at: DateTime.now
    assert_empty Experiment.get_all_enabled(section: section)
  end

  test "teacher based experiment is disabled if other script assigned" do
    script = create :script
    create :teacher_based_experiment,
      percentage: 100,
      script_id: script.id + 1
    assert_empty Experiment.get_all_enabled(section: create(:section), script: script)
  end

  test "teacher based experiment is enabled if same script assigned" do
    script = create :script
    experiment = create :teacher_based_experiment,
      percentage: 100,
      script_id: script.id
    assert_equal [experiment], Experiment.get_all_enabled(section: create(:section), script: script)
  end

  test "single section experiment is enabled" do
    section = create :section
    experiment = create :single_section_experiment,
      section_id: section.id
    assert_equal [experiment], Experiment.get_all_enabled(section: section)
  end

  test "single section experiment is not enabled" do
    section = create :section
    create :single_section_experiment,
      section_id: section.id + 1
    assert_empty Experiment.get_all_enabled(section: section)
  end

  test 'single facilitator experiment is enabled' do
    facilitator_yes = User.first || create(:facilitator)
    facilitator_no = User.second || create(:facilitator)
    experiment = SingleFacilitatorExperiment.first || create(:single_facilitator_experiment, min_user_id: facilitator_yes.id)

    assert_equal [experiment], Experiment.get_all_enabled(user: facilitator_yes)
    assert_empty Experiment.get_all_enabled(user: facilitator_no)
    assert experiment.enabled?(user: facilitator_yes)
    refute experiment.enabled?(user: facilitator_no)
  end
end

class CachedExperimentTest < ExperimentTest
  setup do
    Experiment.stubs(:should_cache?).returns true
    Experiment.update_cache
  end
end
