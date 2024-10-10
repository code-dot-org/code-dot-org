require 'test_helper'
require 'cdo/shared_constants'
require 'policies/unit'

# Includes assertions on the Unit model that the unit deletion script
# takes a dependency on.
class Policies::UnitTest < ActiveSupport::TestCase
  include Curriculum::SharedCourseConstants
  self.use_transactional_test_case = true

  setup do
    UnitGroup.clear_cache
    Unit.clear_cache
  end

  test 'check deletion for stand alone unit in development' do
    unit = create(:script, published_state: PUBLISHED_STATE.in_development)
    assert_equal true, Policies::Unit.can_be_deleted?(unit)
  end

  test 'check deletion for stand alone stable unit' do
    unit = create(:script, published_state: PUBLISHED_STATE.stable)
    assert_equal false, Policies::Unit.can_be_deleted?(unit)
  end

  test 'check deletion for unit (nil published state) in unit group with in_development' do
    unit = create(:script, published_state: nil)
    unit_gp = create(:unit_group, published_state: PUBLISHED_STATE.in_development)
    create :unit_group_unit, unit_group: unit_gp, script: unit, position: 1

    assert_equal true, Policies::Unit.can_be_deleted?(unit)
  end

  test 'check deletion published state unit in_development and unit group stable' do
    unit = create(:script, published_state: PUBLISHED_STATE.in_development)
    unit_gp = create(:unit_group, published_state: PUBLISHED_STATE.stable)
    create :unit_group_unit, unit_group: unit_gp, script: unit, position: 1

    assert_equal true, Policies::Unit.can_be_deleted?(unit)
  end

  test 'check deletion unit with section assignment' do
    unit = create(:script, published_state: PUBLISHED_STATE.in_development)
    create :section, script: unit, unit_group: nil
    assert_equal false, Policies::Unit.can_be_deleted?(unit)
  end
end
