require 'test_helper'

class StatsigAnalyticsHelperTest < ActionView::TestCase
  describe '#load_web_analytics?' do
    subject(:load_web_analytics) {load_web_analytics?(request)}

    let(:ge_region) {nil}
    let(:request_path) {'/'}

    let(:request) do
      ActionDispatch::TestRequest.create.tap do |request|
        request.path = request_path
        request.stubs(:ge_region).returns(ge_region)
      end
    end

    before do
      DCDO.stubs(:get).with('statsig-enabled', true).returns(true)
    end

    it 'returns false' do
      _load_web_analytics.must_equal false
    end

    StatsigAnalyticsHelper::TARGET_PATHS.each do |target_path|
      context "when request path is #{target_path}" do
        let(:request_path) {target_path}

        it 'returns true' do
          _load_web_analytics.must_equal true
        end
      end
    end

    context 'when Statsig is switched off' do
      let(:request_path) {StatsigAnalyticsHelper::TARGET_PATHS.first}

      before do
        DCDO.stubs(:get).with('statsig-enabled', true).returns(false)
      end

      it 'returns false even on a matching path' do
        _load_web_analytics.must_equal false
      end
    end
  end
end
