require 'test_helper'

class Services::CoursesTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe '.canonical_path' do
    let(:current_user) {instance_double(User)}
    let(:path) {'/s/script-1/some-path'}
    let(:params) {{}}
    let(:modularity_enabled) {false}

    before do
      allow(Policies::Courses).to receive(:modularity_enabled?).with(current_user).and_return(modularity_enabled)
      allow(Queries::Courses).to receive(:get_course_context).and_return(nil)
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
        let(:params) {{script_id: 'script-1'}}

        context 'course_context is not found' do
          it 'returns the original path' do
            _(described_class.canonical_path(path, params, current_user)).must_equal path
          end
        end

        context 'course_context is found' do
          let(:course_context) {{course: OpenStruct.new(name: 'cool-course'), unit_group_unit: OpenStruct.new(position: 2)}}

          before do
            allow(Queries::Courses).to receive(:get_course_context).with('script-1').and_return(course_context)
          end

          it 'returns the modified path with /courses/.../units/.../' do
            _(described_class.canonical_path(path, params, current_user)).must_equal '/courses/cool-course/units/2/some-path'
          end
        end
      end

      context 'script_name is present in params[:id]' do
        let(:params) {{id: 'script-2'}}
        let(:path) {'/s/script-2/some-path'}

        context 'course_context is not found' do
          it 'returns the original path' do
            _(described_class.canonical_path(path, params, current_user)).must_equal path
          end
        end

        context 'course_context is found' do
          let(:course_context) {{course: OpenStruct.new(name: 'another-course'), unit_group_unit: OpenStruct.new(position: 3)}}

          before do
            allow(Queries::Courses).to receive(:get_course_context).with('script-2').and_return(course_context)
          end

          it 'returns the modified path with /courses/.../units/.../' do
            _(described_class.canonical_path(path, params, current_user)).must_equal '/courses/another-course/units/3/some-path'
          end
        end
      end
    end
  end
end
