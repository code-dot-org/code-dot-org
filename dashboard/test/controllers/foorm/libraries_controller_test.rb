require 'test_helper'

module Foorm
  class LibrariesControllerTest < ActionController::TestCase
    setup_all do
      @levelbuilder = create :levelbuilder
    end

    test_redirect_to_sign_in_for :editor
    test_user_gets_response_for :editor, user: :student, response: :forbidden
    test_user_gets_response_for :editor, user: :levelbuilder, response: :success
  end
end
