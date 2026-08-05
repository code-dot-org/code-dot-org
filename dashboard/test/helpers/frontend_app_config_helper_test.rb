require 'test_helper'

class FrontendAppConfigHelperTest < ActionView::TestCase
  include ObservabilityHelper
  include StatsigAnalyticsHelper

  describe '#frontend_app_config' do
    before do
      CDO.stubs(:enable_sentry).returns(false)
      CDO.stubs(:safe_statsig_api_client_key).returns('client-test-key')
      CDO.stubs(:managed_test_server?).returns(false)
      DCDO.stubs(:get).with('frontend-observability-sampling-config', {}).returns({})
    end

    it 'composes the observability and analytics sections into one JSON object' do
      _(JSON.parse(frontend_app_config('test-dsn'))).must_equal(
        {
          'observability' => {'provider' => 'none'},
          'analytics' => {'provider' => 'none'},
        }
      )
    end

    it 'carries each section owner\'s values through unchanged' do
      CDO.stubs(:enable_sentry).returns(true)
      CDO.stubs(:managed_test_server?).returns(true)

      _(JSON.parse(frontend_app_config('test-dsn'))).must_equal(
        {
          'observability' => {'provider' => 'sentry', 'sentry' => {'dsn' => 'test-dsn'}},
          'analytics' => {'provider' => 'statsig', 'statsig' => {'clientKey' => 'client-test-key'}},
        }
      )
    end
  end
end
