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
      # Use `routes.append` rather than `routes.draw`: `draw` clears the entire
      # route set and rebuilds it from this block, leaving the production routes
      # (and `url_helpers`) inaccessible for the duration of the test. Any
      # middleware in the request stack that consults `url_helpers` then raises
      # NoMethodError. `append` keeps the real routes intact and adds ours on
      # top after `reload_routes!` re-evaluates routes.rb.
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
