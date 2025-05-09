require 'test_helper'

class Services::CoursesTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe '.canonical_path' do
    let(:current_user) {instance_double(User)}
    let(:path) {'/s/script-1/some-path'}
    let(:params) {{}}
    let(:modularity_enabled) {false}
    let(:unit) {nil}
    let(:unit_group) {nil}
    let(:unit_group_unit) {nil}
    let(:course_context) do
      {
        unit: unit,
        unit_group: unit_group,
        unit_group_unit: unit_group_unit,
      }
    end

    before do
      allow(Policies::Courses).to receive(:modularity_enabled?).with(any_args).and_return(modularity_enabled)
      allow(Queries::Courses).to receive(:get_course_context).and_return(course_context)
    end

    context 'the modularity experiment is not enabled' do
      it 'returns the original path' do
        _(described_class.canonical_path(path, params, current_user)).must_equal path
      end
    end

    context 'the modularity experiment is enabled' do
      let(:modularity_enabled) {true}

      context 'script_name is not present in params' do
        it 'returns the original path' do
          _(described_class.canonical_path(path, params, current_user)).must_equal path
        end
      end

      context 'script_name is present in params[:script_id]' do
        let(:script_name) {'script-1'}
        let(:params) {{script_id: script_name}}
        let(:unit) {create :unit, name: script_name}

        context 'unit_group is not found' do
          it 'returns the original path' do
            _(described_class.canonical_path(path, params, current_user)).must_equal path
          end
        end

        context 'unit_group is found' do
          let(:unit_group) {create :unit_group, name: 'cool-course'}
          let(:position) {2}
          let(:unit_group_unit) {create :unit_group_unit, script_id: unit.id, course_id: unit_group.id, position: position}

          it 'returns the modified path with /courses/.../units/.../' do
            _(described_class.canonical_path(path, params, current_user)).must_equal '/courses/cool-course/units/2/some-path'
          end
        end
      end

      context 'script_name is present in params[:id]' do
        let(:script_name) {'script-1'}
        let(:params) {{id: script_name}}
        let(:path) {'/s/script-1/some-path'}
        let(:unit) {create :unit, name: script_name}

        context 'unit_group is not found' do
          it 'returns the original path' do
            _(described_class.canonical_path(path, params, current_user)).must_equal path
          end
        end

        context 'unit_group is found' do
          let(:unit_group) {create :unit_group, name: 'cool-course'}
          let(:position) {2}
          let(:unit_group_unit) {create :unit_group_unit, script_id: unit.id, course_id: unit_group.id, position: position}

          it 'returns the modified path with /courses/.../units/.../' do
            _(described_class.canonical_path(path, params, current_user)).must_equal '/courses/cool-course/units/2/some-path'
          end
        end
      end
    end
  end
end
