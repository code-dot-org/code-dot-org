require 'test_helper'

class UnitGroupUnitTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks
  describe '.get_with_position_from_cache' do
    let(:script_name) {'test-script'}
    let!(:unit) {create(:unit, name: script_name)}
    let(:course) {create(:unit_group)}
    let(:unit_position) {123}
    let!(:unit_group_unit) {create(:unit_group_unit, course_id: course.id, position: unit_position, script_id: unit.id)}
    let(:should_cache) {false}
    let(:query_count) {1}

    before do
      allow(UnitGroup).to receive(:should_cache?).and_return(should_cache)
    end

    context('should not cache') do
      it('does not cache the UnitGroupUnit') do
        _(UnitGroupUnit.get_with_position_from_cache(course.id, unit_position)).must_equal(unit_group_unit)
        assert_queries(query_count) do
          _(UnitGroupUnit.get_with_position_from_cache(course.id, unit_position)).must_equal(unit_group_unit)
        end
      end
    end

    context('should cache') do
      let(:should_cache) {true}
      let(:query_count) {0}

      it('caches the UnitGroupUnit') do
        _(UnitGroupUnit.get_with_position_from_cache(course.id, unit_position)).must_equal(unit_group_unit)
        assert_queries(query_count) do
          _(UnitGroupUnit.get_with_position_from_cache(course.id, unit_position)).must_equal(unit_group_unit)
        end
      end
    end
  end
end
