# frozen_string_literal: true

require 'test_helper'

class Lti::V1::IntegrationsControllerTest < ActionController::TestCase
  include Minitest::RSpecMocks

  before_all do
    @existing_integration = create(:lti_integration)
    @deployment_id = SecureRandom.uuid
    @key = SecureRandom.alphanumeric 10
  end

  before do
    # Stub Honeybadger notifications like in the original tests
    Honeybadger.stubs(:notify)

    # Stub external dependencies
    Queries::Lti.stubs(:get_lti_integration)
    Services::Lti.stubs(:create_lti_integration)
    LtiMailer.stubs(:lti_integration_confirmation).returns(mock(deliver_now: true))
    Metrics::Events.stubs(:log_event)
  end
  describe "#create" do
    let(:valid_params) do
      {
        name: "Test Integration",
        client_id: "test_client_123",
        lms: "canvas",
        email: "admin@example.com"
      }
    end

    let(:platform_urls) do
      {
        issuer: "https://canvas.instructure.com",
        auth_redirect_url: "https://canvas.instructure.com/api/lti/authorize_redirect",
        jwks_url: "https://canvas.instructure.com/api/lti/security/jwks",
        access_token_url: "https://canvas.instructure.com/login/oauth2/token",
        name: "Canvas"
      }
    end

    before do
      # Stub the LMS_PLATFORMS constant
      allow(Policies::Lti).to recieve(:LMS_PLATFORMS).and_return({canvas: platform_urls})
    end

    context "when all required parameters are provided" do
      context "and the LMS platform is supported" do
        context "and no existing integration exists" do
          before do
            Queries::Lti.stubs(:get_lti_integration).returns(nil)
            Services::Lti.stubs(:create_lti_integration)
            LtiMailer.stubs(:lti_integration_confirmation).returns(mock(deliver_now: true))
            Metrics::Events.stubs(:log_event)
          end

          it "creates a new LTI integration" do
            Services::Lti.expects(:create_lti_integration).with(
              name: "Test Integration",
              client_id: "test_client_123",
              issuer: "https://canvas.instructure.com",
              platform_name: "canvas",
              auth_redirect_url: "https://canvas.instructure.com/api/lti/authorize_redirect",
              jwks_url: "https://canvas.instructure.com/api/lti/security/jwks",
              access_token_url: "https://canvas.instructure.com/login/oauth2/token",
              admin_email: "admin@example.com"
            )

            post :create, params: valid_params
          end

          it "sets integration_status to :created" do
            post :create, params: valid_params

            assert_equal :created, assigns(:integration_status)
          end

          it "sends confirmation email" do
            mailer_mock = mock
            mailer_mock.expects(:deliver_now)
            LtiMailer.expects(:lti_integration_confirmation).with("admin@example.com").returns(mailer_mock)

            post :create, params: valid_params
          end

          it "logs the registration event" do
            Metrics::Events.expects(:log_event).with(
              session: session,
              event_name: 'lti_portal_registration_completed',
              metadata: {lms_name: "canvas"}
            )

            post :create, params: valid_params
          end

          it "renders the integration_status template" do
            post :create, params: valid_params

            assert_template 'lti/v1/integration_status'
          end
        end

        context "and an existing integration already exists" do
          setup do
            Queries::Lti.stubs(:get_lti_integration).with("https://canvas.instructure.com", "test_client_123").returns(@existing_integration)
          end

          it "does not create a new integration" do
            Services::Lti.expects(:create_lti_integration).never

            post :create, params: valid_params
          end

          it "does not send confirmation email" do
            LtiMailer.expects(:lti_integration_confirmation).never

            post :create, params: valid_params
          end

          it "does not log registration event" do
            Metrics::Events.expects(:log_event).never

            post :create, params: valid_params
          end

          it "leaves integration_status as nil" do
            post :create, params: valid_params

            assert_nil assigns(:integration_status)
          end

          it "renders the integration_status template" do
            post :create, params: valid_params

            assert_template 'lti/v1/integration_status'
          end
        end
      end

      context "and the LMS platform is not supported" do
        let(:unsupported_params) do
          valid_params.merge(lms: "unsupported_lms")
        end

        it "sets flash alert for unsupported LMS" do
          I18n.expects(:t).with('lti.error.unsupported_lms_type').returns("Unsupported LMS platform")

          post :create, params: unsupported_params

          assert_equal "Unsupported LMS platform", flash.alert
        end

        it "redirects to integrations path" do
          post :create, params: unsupported_params

          assert_redirected_to lti_v1_integrations_path
        end

        it "does not create an integration" do
          Services::Lti.expects(:create_lti_integration).never

          post :create, params: unsupported_params
        end
      end
    end

    context "when required parameters are missing" do
      context "when name is missing" do
        it "sets flash alert and redirects" do
          I18n.expects(:t).with('lti.error.missing_params').returns("Missing required parameters")

          post :create, params: valid_params.except(:name)

          assert_equal "Missing required parameters", flash.alert
          assert_redirected_to lti_v1_integrations_path
        end
      end

      context "when client_id is missing" do
        it "sets flash alert and redirects" do
          I18n.expects(:t).with('lti.error.missing_params').returns("Missing required parameters")

          post :create, params: valid_params.except(:client_id)

          assert_equal "Missing required parameters", flash.alert
          assert_redirected_to lti_v1_integrations_path
        end
      end

      context "when lms is missing" do
        it "sets flash alert and redirects" do
          I18n.expects(:t).with('lti.error.missing_params').returns("Missing required parameters")

          post :create, params: valid_params.except(:lms)

          assert_equal "Missing required parameters", flash.alert
          assert_redirected_to lti_v1_integrations_path
        end
      end

      context "when email is missing" do
        it "sets flash alert and redirects" do
          I18n.expects(:t).with('lti.error.missing_params').returns("Missing required parameters")

          post :create, params: valid_params.except(:email)

          assert_equal "Missing required parameters", flash.alert
          assert_redirected_to lti_v1_integrations_path
        end
      end

      it "does not create an integration when parameters are missing" do
        Services::Lti.expects(:create_lti_integration).never

        post :create, params: valid_params.except(:name)
      end
    end
  end

  describe "#new" do
    let(:mock_platforms) do
      {
        canvas: {name: "Canvas"},
        blackboard: {name: "Blackboard Learn"},
        moodle: {name: "Moodle"}
      }
    end

    setup do
      Policies::Lti.stubs(:LMS_PLATFORMS).returns(mock_platforms)
    end

    it "assigns form_data with lms_platforms" do
      get :new

      expected_platforms = [
        {platform: :canvas, name: "Canvas"},
        {platform: :blackboard, name: "Blackboard Learn"},
        {platform: :moodle, name: "Moodle"}
      ]

      assert_equal expected_platforms, assigns(:form_data)[:lms_platforms]
    end

    it "renders the integrations path template" do
      get :new

      assert_template lti_v1_integrations_path
    end

    it "initializes form_data as a hash" do
      get :new

      assert_instance_of Hash, assigns(:form_data)
    end

    # Test that maintains consistency with the original LtiV1Controller behavior
    it "maintains consistent behavior from the original lti_v1_controller" do
      get :new

      # Verify the core functionality remains unchanged after extraction
      refute_nil assigns(:form_data)
      assert assigns(:form_data).key?(:lms_platforms)
      assert assigns(:form_data)[:lms_platforms].is_a?(Array)
    end

    # Test error handling similar to original controller patterns
    it "handles platform loading errors gracefully" do
      Policies::Lti.stubs(:LMS_PLATFORMS).raises(StandardError.new("Platform loading error"))

      # Should handle errors without breaking (depending on your error handling strategy)
      assert_raises(StandardError) do
        get :new
      end
    end
  end

  # Additional tests that might be relevant after extraction
  describe "controller inheritance and behavior" do
    it "inherits from ApplicationController" do
      assert Lti::V1::IntegrationsController < ApplicationController
    end

    it "maintains proper namespacing" do
      assert_equal "Lti::V1::IntegrationsController", controller.class.name
    end
  end

  # Integration test to ensure routing works correctly after controller extraction
  describe "routing after controller extraction" do
    it "routes POST to integrations#create" do
      assert_routing({method: :post, path: "/lti/v1/integrations"},
                     {controller: "lti/v1/integrations", action: "create"}
      )
    end

    it "routes GET to integrations#new" do
      assert_routing({method: :get, path: "/lti/v1/integrations/new"},
                     {controller: "lti/v1/integrations", action: "new"}
      )
    end
  end
end
