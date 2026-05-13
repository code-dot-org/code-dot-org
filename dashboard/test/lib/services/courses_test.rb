require 'test_helper'

class Services::CoursesTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe '.canonical_path' do
    let(:subject) {described_class.canonical_path(path, unit_name)}
    let(:path) {"/s/#{unit_name}/some-path"}
    let(:modularity_enabled) {false}
    let(:unit_name) {'script-1'}
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
    end

    context 'the modularity experiment is not enabled' do
      it 'returns the original path' do
        _(subject).must_equal path
      end
    end

    context 'the modularity experiment is enabled' do
      let(:modularity_enabled) {true}

      context 'unit_name_or_id is nil' do
        let(:unit_name) {nil}
        it 'returns the original path' do
          _(subject).must_equal path
        end
      end

      context 'unit_name_or_id is defined' do
        let!(:unit) {create(:unit, name: unit_name)}

        before do
          unit.reload
        end

        context 'unit_group is not found' do
          it 'returns the original path' do
            _(subject).must_equal path
          end
        end

        context 'unit_group is found' do
          let(:unit_group) {create(:unit_group, name: 'cool-course')}
          let(:position) {2}
          let!(:unit_group_unit) {create(:unit_group_unit, script_id: unit.id, course_id: unit_group.id, position: position)}

          it 'returns the modified path with /courses/.../units/.../' do
            _(subject).must_equal '/courses/cool-course/units/2/some-path'
          end
        end
      end
    end
  end
end
