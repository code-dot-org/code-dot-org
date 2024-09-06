require 'test_helper'
require 'cdo/shared_constants'

# Includes assertions on the Unit model that the unit deletion script
# takes a dependency on.
class UnitDeletionScriptTest < ActiveSupport::TestCase
  include Curriculum::SharedCourseConstants
  self.use_transactional_test_case = true

  setup_all do
  end

  setup do
    UnitGroup.clear_cache
    Unit.clear_cache
  end

  test 'get published state for stand alone' do
    unit = create(:script, published_state: PUBLISHED_STATE.in_development)
    assert_equal PUBLISHED_STATE.in_development, unit.get_published_state
  end

  test 'get published state for unit in unit group with nil published state' do
    unit = create(:script, published_state: nil)
    unit_gp = create(:unit_group, published_state: PUBLISHED_STATE.in_development)
    create :unit_group_unit, unit_group: unit_gp, script: unit, position: 1

    assert_equal PUBLISHED_STATE.in_development, unit.get_published_state
  end

  test 'get published state unit in_development and unit group stable' do
    unit = create(:script, published_state: PUBLISHED_STATE.in_development)
    unit_gp = create(:unit_group, published_state: PUBLISHED_STATE.stable)
    create :unit_group_unit, unit_group: unit_gp, script: unit, position: 1

    assert_equal PUBLISHED_STATE.in_development, unit.get_published_state
  end

  test 'get published state unit stable and unit group in_development' do
    unit = create(:script, published_state: PUBLISHED_STATE.stable)
    unit_gp = create(:unit_group, published_state: PUBLISHED_STATE.in_development)
    create :unit_group_unit, unit_group: unit_gp, script: unit, position: 1

    assert_equal PUBLISHED_STATE.stable, unit.get_published_state
  end
end
