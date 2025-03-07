require 'test_helper'

class Queries::CoursesTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe '.get_course_context' do
    let(:script_name) {'test-script'}
    let(:unit) {nil}

    before do
      allow(Unit).to receive(:get_from_cache).and_return(unit)
    end

    context 'unit is nil' do
      it 'returns nil' do
        _(Queries::Courses.get_course_context(script_name)).must_be_nil
      end
    end

    context 'unit is defined' do
      let(:unit) {instance_double(Unit)}
      let(:unit_group_unit) {nil}

      before do
        allow(unit).to receive(:id).and_return(1)
        allow(UnitGroupUnit).to receive(:find_by).and_return(unit_group_unit)
      end

      context 'unit_group_unit is nil' do
        it 'returns nil' do
          _(Queries::Courses.get_course_context(script_name)).must_be_nil
        end
      end

      context 'unit_group_unit is defined' do
        let(:unit_group_unit) {instance_double(UnitGroupUnit)}
        let(:course) {instance_double(UnitGroup)}

        before do
          allow(course).to receive(:id).and_return(1)
          allow(UnitGroupUnit).to receive(:where).and_return([unit_group_unit])
          allow(unit_group_unit).to receive(:course_id).and_return(course.id)
          allow(UnitGroup).to receive(:get_from_cache).and_return(course)
        end

        it 'returns course context' do
          expected_course_context = {
            course: course,
            unit_group_unit: unit_group_unit,
          }
          _(Queries::Courses.get_course_context(script_name)).must_equal expected_course_context
        end
      end
    end
  end
end
