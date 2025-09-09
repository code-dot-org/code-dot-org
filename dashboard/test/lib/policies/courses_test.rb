require 'test_helper'
class Policies::CoursesTest < ActiveSupport::TestCase
  include Minitest::RSpecMocks

  describe '.modularity_enabled?' do
    let(:modularity_enabled) {Policies::Courses.modularity_enabled?}

    context 'nothing configured' do
      it 'defaults to true' do
        _(modularity_enabled).must_equal true
      end
    end

    context 'DCDO is configured' do
      let(:dcdo_value) {false}

      before do
        allow(DCDO).to receive(:get).with('modularity', true).and_return(dcdo_value)
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
      end
    end
  end
end
