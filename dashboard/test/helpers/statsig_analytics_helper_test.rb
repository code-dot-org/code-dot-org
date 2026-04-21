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

    it 'returns false' do
      _load_web_analytics.must_equal false
    end

    context 'when Global Edition region is present' do
      let(:ge_region) {'expected_ge_region'}

      it 'returns true' do
        _load_web_analytics.must_equal true
      end
    end

    StatsigAnalyticsHelper::TARGET_PATHS.each do |target_path|
      context "when request path is #{target_path}" do
        let(:request_path) {target_path}

        it 'returns true' do
          _load_web_analytics.must_equal true
        end
      end
    end
  end
end
