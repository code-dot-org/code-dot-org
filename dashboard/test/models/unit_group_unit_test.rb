require 'test_helper'

class UnitGroupUnitTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks
  describe '.get_with_position_from_cache' do
    let(:should_cache) {false}
    let(:db_call_count) {2}
    let(:course_id) {123}
    let(:unit_position) {456}
    let(:unit_group_unit) {instance_double(UnitGroupUnit)}
    let(:subject) {UnitGroupUnit.get_with_position_from_cache(course_id, unit_position)}

    before do
      allow(UnitGroupUnit).to receive(:find_by).with(course_id: course_id, position: unit_position).exactly(db_call_count).times.and_return(unit_group_unit)
    end

    context('should not cache') do
      it('does not cache the UnitGroupUnit') do
        _(subject).must_equal(unit_group_unit)
        _(subject).must_equal(unit_group_unit)
      end
    end

    context('should cache') do
      let(:should_cache) {true}
      let(:db_call_count) {1}

      it('caches the UnitGroupUnit') do
        _(subject).must_equal(unit_group_unit)
        _(subject).must_equal(unit_group_unit)
      end
    end
  end

  describe '.get_with_unit_from_cache' do
    let(:should_cache) {false}
    let(:db_call_count) {2}
    let(:unit_id) {123}
    let(:unit_group_units) {[instance_double(UnitGroupUnit)]}
    let(:subject) {UnitGroupUnit.get_with_unit_from_cache(unit_id)}

    before do
      allow(UnitGroupUnit).to receive(:where).with(script_id: unit_id).exactly(db_call_count).times.and_return(unit_group_units)
    end

    context('should not cache') do
      it('does not cache the UnitGroupUnits') do
        _(subject).must_equal(unit_group_units)
        _(subject).must_equal(unit_group_units)
      end
    end

    context('should cache') do
      let(:should_cache) {true}
      let(:db_call_count) {1}

      it('caches the UnitGroupUnit') do
        _(subject).must_equal(unit_group_units)
        _(subject).must_equal(unit_group_units)
      end
    end
  end
end
