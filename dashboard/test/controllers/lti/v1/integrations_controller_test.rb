# frozen_string_literal: true

require 'test_helper'

class Lti::V1::IntegrationsControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  describe 'GET /lti/v1/integrations/new' do
    it 'assigns form_data with lms_platforms' do
      get '/lti/v1/integrations/new'

      _(assigns(:form_data)).wont_be_nil
      _(assigns(:form_data)[:lms_platforms]).must_be_instance_of Array
      _(assigns(:form_data)[:lms_platforms]).wont_be_empty
    end

    it 'renders the integrations template' do
      get '/lti/v1/integrations/new'

      assert_template 'lti/v1/integrations'
    end
  end

  describe 'POST /lti/v1/integrations' do
    let(:integration_name) {'Test School'}
    let(:client_id) {'test123'}
    let(:lms) {'canvas_cloud'}
    let(:email) {'test@example.com'}

    it 'creates a new integration with valid parameters' do
      client_id = "test_#{SecureRandom.hex(8)}"

      post '/lti/v1/integrations', params: {name: integration_name, client_id: client_id, lms: lms, email: email}

      assert_template 'lti/v1/integration_status'
      _(assigns(:integration_status)).must_equal :created
    end

    it 'does not create a new integration if one already exists' do
      client_id = "duplicate_#{SecureRandom.hex(8)}"

      post '/lti/v1/integrations', params: {name: integration_name, client_id: client_id, lms: lms, email: email}
      assert_template 'lti/v1/integration_status'
      _(assigns(:integration_status)).must_equal :created

      post '/lti/v1/integrations', params: {name: integration_name, client_id: client_id, lms: lms, email: email}
      assert_template 'lti/v1/integration_status'
      _(assigns(:integration_status)).must_be_nil
    end

    context 'with missing or invalid inputs' do
      it 'does not create integration when client_id is missing' do
        post '/lti/v1/integrations', params: {name: integration_name, lms: lms, email: email}

        _(flash[:alert]).must_equal I18n.t('lti.error.missing_params')
      end

      it 'does not create integration when lms is missing' do
        post '/lti/v1/integrations', params: {name: integration_name, client_id: client_id, lms: '', email: email}

        _(flash[:alert]).must_equal I18n.t('lti.error.missing_params')
      end

      it 'does not create integration when email is missing' do
        post '/lti/v1/integrations', params: {name: integration_name, client_id: client_id, lms: lms}

        _(flash[:alert]).must_equal I18n.t('lti.error.missing_params')
      end

      it 'does not create integration when name is missing' do
        post '/lti/v1/integrations', params: {client_id: client_id, lms: lms, email: email}

        _(flash[:alert]).must_equal I18n.t('lti.error.missing_params')
      end

      it 'does not create integration when lms type is unsupported' do
        post '/lti/v1/integrations', params: {name: integration_name, client_id: client_id, lms: 'unsupported', email: email}

        _(flash[:alert]).must_equal I18n.t('lti.error.unsupported_lms_type')
      end
    end
  end
end
