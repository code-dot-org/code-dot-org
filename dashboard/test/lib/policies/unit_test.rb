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

  test 'check deletion for unit (nil published state) in unit group with in_development' do
    unit = create(:script)
    unit_gp = create(:unit_group, published_state: PUBLISHED_STATE.in_development)
    create(:unit_group_unit, unit_group: unit_gp, script: unit, position: 1)

    assert_equal true, Policies::Unit.can_be_deleted?(unit)
  end

  test 'check deletion unit with section assignment' do
    unit = create(:single_unit_course, published_state: PUBLISHED_STATE.in_development).first_unit
    create(:section, script: unit)
    assert_equal false, Policies::Unit.can_be_deleted?(unit)
  end
end
