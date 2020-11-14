require 'test_helper'

module Foorm
  class FormsControllerTest < ActionController::TestCase
    test_redirect_to_sign_in_for :create, method: :post, params: {name: 'name', version: 0}
    test_redirect_to_sign_in_for :update, method: :put, params: {name: 'name', version: 0}
  end
end
