require_relative '../../test_helper'
require 'cdo/cloud_formation/cdo_app'

module Cdo
  module CloudFormation
    class CdoAppTest < Minitest::Test
      def setup
        # Create a mock object that acts like CdoApp
        @app = Minitest::Mock.new
      end

      def test_s3_bucket_namespace_production
        # Create an instance with dummy options
        # We need to stub logic that CdoApp uses, or subclass it for testing.
        # Since CdoApp inherits from StackTemplate and does a lot of initialization,
        # it might be easier to just include the module if it was a module, but it's a class.

        # Testing strategy: Subclass CdoApp or just test the method logic by mocking.
        # Let's instantiate CdoApp with minimal options and stub studio_subdomain.

        # We'll use a test subclass to avoid side effects of initialize
        test_class = Class.new(CdoApp) do
          # rubocop:disable Style/RedundantInitialize
          def initialize
            # Skip initialization side effects
          end
          # rubocop:enable Style/RedundantInitialize
          attr_accessor :studio_subdomain
        end

        app = test_class.new

        app.studio_subdomain = 'studio.code.org'
        assert_equal 'org.code.studio', app.s3_bucket_namespace

        app.studio_subdomain = 'test-studio.code.org'
        assert_equal 'org.code.test-studio', app.s3_bucket_namespace

        app.studio_subdomain = 'adhoc.test.code.org'
        assert_equal 'org.code.test.adhoc', app.s3_bucket_namespace
      end
    end
  end
end
