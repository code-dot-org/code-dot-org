require 'test_helper'

class HoneybadgerTest < ActionDispatch::IntegrationTest
  describe 'notice' do
    ERROR_MESSAGE = 'HoneybadgerTest error_message'.freeze

    class ErrorController < ApplicationController
      def notify
        Honeybadger.notify(ERROR_MESSAGE)
      end
    end

    subject(:notice) {Honeybadger::Backend::Test.notifications[:notices].find {|n| n.error_message == ERROR_MESSAGE}}

    let(:user) {create(:user)}

    around do |test|
      routes = Rails.application.routes
      original_disable_clear_and_finalize = routes.disable_clear_and_finalize

      routes.disable_clear_and_finalize = true
      routes.draw do
        get :notify_error, controller: ErrorController.new.controller_path, action: :notify
      end

      test.call
    ensure
      routes.disable_clear_and_finalize = original_disable_clear_and_finalize
      Rails.application.reload_routes!
    end

    before do
      sign_in user
    end

    it 'filters encrypted user data' do
      get notify_error_path
      _notice.wont_be_nil
      _(notice.as_json.dig(:request, :session, 'warden.user.user.key')).must_equal '[FILTERED]'
    end
  end
end
