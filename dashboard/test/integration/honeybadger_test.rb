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
      # routes.append, not routes.draw. draw clears the route table and rebuilds
      # it from this block, leaving the production routes (and the url_helpers
      # derived from them) inaccessible during the test body; any middleware in
      # the Rack stack that consults url_helpers then raises NoMethodError.
      # append queues the route onto the existing table, which the following
      # reload_routes! finalizes alongside the normal routes.rb load.
      Rails.application.routes.append do
        get :notify_error, to: "#{ErrorController.new.controller_path}#notify"
      end
      Rails.application.reload_routes!

      test.call
    ensure
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
