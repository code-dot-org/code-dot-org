require 'test_helper'

class Queries::CoursesTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe '.get_course_context' do
    let(:script_name) {'test-script'}
    let(:unit) {nil}
    let(:subject) {Queries::Courses.get_course_context(script_name)}

    context 'unit is nil' do
      it 'returns nil' do
        _(subject).must_be_nil
      end
    end

    context 'unit is defined' do
      let!(:unit) {create :unit, name: script_name}
      let(:unit_group_unit) {nil}

      context 'unit_group_unit is nil' do
        it 'returns nil' do
          _(subject).must_be_nil
        end
      end

      context 'unit_group_unit is defined' do
        let(:course) {create :unit_group}
        let(:unit_position) {123}
        let!(:unit_group_unit) {create :unit_group_unit, course_id: course.id, position: unit_position, script_id: unit.id}
        let(:course_context) do
          {
            course: course,
            unit_group_unit: unit_group_unit,
          }
        end

        it 'returns course context' do
          _(subject).must_equal course_context
        end

        context 'caching is enabled' do
          before do
            allow(Unit).to receive(:should_cache?).and_return(true)
          end
          it 'caches the course context' do
            _(Queries::Courses.get_course_context(script_name)).must_equal course_context
            assert_queries(0) do
              _(Queries::Courses.get_course_context(script_name)).must_equal course_context
            end
          end
        end
      end
    end
  end
end
