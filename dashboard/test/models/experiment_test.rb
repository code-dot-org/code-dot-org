require 'test_helper'

class ExperimentTest < ActiveSupport::TestCase
  setup do
    Experiment.stubs(:should_cache?).returns false
  end

  test "no experiments" do
    assert_empty Experiment.getAllEnabled()
  end

  test "single section experiment is enabled" do
    section = create :section
    experiment = create :single_section_experiment,
      section_id: section.id
    assert_equal [experiment], Experiment.getAllEnabled(section: section)
  end

  test "single section experiment is not enabled" do
    section = create :section
    experiment = create :single_section_experiment,
      section_id: section.id + 1
    assert_empty Experiment.getAllEnabled(section: section)
  end
end

class CachedExperimentTest < ExperimentTest
  setup do
    Experiment.stubs(:should_cache?).returns true
  end
end
