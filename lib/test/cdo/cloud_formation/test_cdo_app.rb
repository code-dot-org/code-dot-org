require_relative '../../test_helper'
require 'cdo/cloud_formation/cdo_app'

module Cdo
  module CloudFormation
    class CdoAppTest < Minitest::Test
      def setup
        # Create a mock object that acts like CdoApp
        @app = Minitest::Mock.new
      end

      # Avoids CdoApp#initialize, which calls git and AWS.
      def build_app(stack_name:, domain: 'cdn-code.org', branch: nil)
        test_class = Class.new(CdoApp) do
          # rubocop:disable Style/RedundantInitialize
          def initialize
          end
          # rubocop:enable Style/RedundantInitialize
          attr_accessor :stack_name, :branch, :options
        end
        app = test_class.new
        app.stack_name = stack_name
        app.branch = branch
        app.options = OpenStruct.new(domain: domain)
        app
      end

      def test_check_stack_name_length_accepts_63_char_bucket_name
        # 'org.cdn-code.' + 30 + '-studio.user-content' = 63
        app = build_app(stack_name: 'adhoc-' + ('a' * 24))
        assert_equal 63, app.user_content_bucket_name.length
        app.check_stack_name_length!
      end

      def test_check_stack_name_length_rejects_64_char_bucket_name
        app = build_app(stack_name: 'adhoc-' + ('a' * 25))
        error = assert_raises(ArgumentError) {app.check_stack_name_length!}
        assert_includes error.message, "Stack name 'adhoc-#{'a' * 25}' is too long"
        assert_includes error.message, 'would be 64 characters, but S3 allows at most 63'
        assert_includes error.message, 'at most 30 characters'
        refute_includes error.message, 'STACK_NAME='
      end

      def test_check_stack_name_length_suggests_shorter_name_for_branch_default
        branch = 'adhoc-seeds-ui-test-content'
        app = build_app(stack_name: "adhoc-#{branch}", branch: branch)
        error = assert_raises(ArgumentError) {app.check_stack_name_length!(true)}
        assert_includes error.message,
          "'org.cdn-code.adhoc-adhoc-seeds-ui-test-content-studio.user-content' would be 66 characters"
        assert_includes error.message, 'a branch name longer than 24 characters'
        assert_includes error.message, 'STACK_NAME=adhoc-adhoc-seeds-ui-test-cont'
      end

      def test_check_stack_name_length_accounts_for_domain
        app = build_app(stack_name: 'adhoc-' + ('a' * 24), domain: 'code.org')
        app.check_stack_name_length!
        app = build_app(stack_name: 'adhoc-' + ('a' * 28), domain: 'code.org')
        app.check_stack_name_length!
        app = build_app(stack_name: 'adhoc-' + ('a' * 29), domain: 'code.org')
        assert_raises(ArgumentError) {app.check_stack_name_length!}
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
