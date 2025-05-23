require 'test_helper'
class Policies::CoursesTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe '.modularity_enabled?' do
    let(:user) {instance_double(User)}
    let(:modularity_enabled) {Policies::Courses.modularity_enabled?(user)}

    context 'nothing configured' do
      it 'defaults to false' do
        _(modularity_enabled).must_equal false
      end
    end

    context 'DCDO is configured' do
      let(:dcdo_value) {false}

      before do
        allow(DCDO).to receive(:get).with('modularity', false).and_return(dcdo_value)
      end

      context 'DCDO is true' do
        let(:dcdo_value) {true}

        it 'returns true' do
          _(modularity_enabled).must_equal true
        end
      end

      context 'DCDO is false' do
        it 'returns false' do
          _(modularity_enabled).must_equal false
        end

        context 'Pilot Experiment is true' do
          let(:pilot_enabled) {true}

          before do
            allow(Experiment).to receive(:enabled?).with(user: user, experiment_name: 'modularity').and_return(pilot_enabled)
          end

          it 'returns true' do
            _(modularity_enabled).must_equal true
          end
        end
      end
    end
  end
end
