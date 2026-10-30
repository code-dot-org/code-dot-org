require 'test_helper'

class Queries::CoursesTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe '.get_course_context' do
    let(:script_name) {'test-script'}
    let(:unit) {nil}
    let(:unit_group) {nil}
    let(:unit_group_unit) {nil}
    let(:course_context) do
      {
        unit_group: unit_group,
        unit_group_unit: unit_group_unit,
        unit: unit,
      }
    end
    let(:subject) {described_class.get_course_context(script_name)}

    context 'unit is nil' do
      it 'returns course context' do
        _(subject).must_equal course_context
      end
    end

    context 'unit is defined' do
      let!(:unit) {create(:unit, name: script_name)}

      context 'unit_group_unit is nil' do
        it 'returns course context' do
          _(subject).must_equal course_context
        end
      end

      context 'unit_group_unit is defined' do
        let(:unit_group) {create(:unit_group)}
        let(:unit_position) {123}
        let!(:unit_group_unit) {create(:unit_group_unit, course_id: unit_group.id, position: unit_position, script_id: unit.id)}

        it 'returns course context' do
          _(subject).must_equal course_context
        end

        context 'caching is enabled' do
          before do
            allow(Unit).to receive(:should_cache?).and_return(true)
          end

          it 'caches the course context' do
            _(described_class.get_course_context(script_name)).must_equal course_context
            assert_queries(0) do
              _(described_class.get_course_context(script_name)).must_equal course_context
            end
          end
        end

        context 'unit_id is used instead of unit_name' do
          it 'returns course context' do
            _(described_class.get_course_context(unit.id)).must_equal course_context
          end
        end
      end
    end
  end

  describe '.unit_group_unit' do
    let(:unit) {nil}
    let(:unit_group) {nil}
    let(:unit_group_unit) {nil}
    let(:subject) {described_class.unit_group_unit(unit, unit_group)}

    context 'unit and unit_group are nil' do
      it 'returns nil' do
        _(subject).must_be_nil
      end
    end

    context 'unit defined' do
      let(:original_unit_group) {create(:unit_group)}
      let(:unit) {create(:unit, original_unit_group: original_unit_group)}
      let!(:unit_group_unit) {create(:unit_group_unit, course_id: original_unit_group.id, script_id: unit.id, position: 1)}

      before do
        unit.reload
      end

      it 'returns unit_group_unit' do
        _(subject).must_equal unit_group_unit
      end

      context 'unit_group is defined' do
        let!(:original_unit_group_unit) {create(:unit_group_unit, course_id: original_unit_group.id, script_id: unit.id, position: 1)}
        let(:unit_group) {create(:unit_group)}
        let!(:unit_group_unit) {create(:unit_group_unit, course_id: unit_group.id, script_id: unit.id, position: 1)}

        it 'returns unit_group_unit' do
          _(subject).must_equal unit_group_unit
        end

        context 'given original_unit_group' do
          it 'return original_unit_group_unit' do
            _(described_class.unit_group_unit(unit, original_unit_group)).must_equal original_unit_group_unit
          end
        end
      end
    end
  end

  describe '.get_unit_context' do
    let(:course_name) {nil}
    let(:unit_position) {nil}
    let(:subject) {described_class.get_unit_context(course_name, unit_position)}

    context 'course_name is nil' do
      it 'returns nil' do
        _(subject).must_be_nil
      end
    end

    context 'course_name is defined' do
      let(:unit_group) {create(:unit_group)}
      let(:course_name) {unit_group.name}

      context 'unit_position is nil' do
        it 'returns nil' do
          _(subject).must_be_nil
        end
      end

      context 'unit_position is defined' do
        let(:unit) {create(:unit, original_unit_group: unit_group)}
        let(:unit_position) {1}
        let!(:unit_group_unit) {create(:unit_group_unit, course_id: unit_group.id, script_id: unit.id, position: unit_position)}
        let(:unit_context) do
          {
            unit_group: unit_group,
            unit_group_unit: unit_group_unit,
            unit: unit,
          }
        end

        before do
          unit.reload
        end

        it 'returns unit_context' do
          _(subject).must_equal unit_context
        end

        context 'unknown unit_position' do
          it 'returns nil' do
            _(described_class.get_unit_context(course_name, 999)).must_be_nil
          end
        end

        context 'caching is enabled' do
          before do
            allow(Unit).to receive(:should_cache?).and_return(true)
          end

          it 'caches the unit context' do
            _(described_class.get_unit_context(course_name, unit_position)).must_equal unit_context
            assert_queries(0) do
              _(described_class.get_unit_context(course_name, unit_position)).must_equal unit_context
            end
          end
        end
      end
    end
  end
end
