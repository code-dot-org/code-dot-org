require 'test_helper'

module Pd::Application
  class PrincipalApproval1819ApplicationTest < ActiveSupport::TestCase
    test 'does not require user or status' do
      application = build :pd_principal_approval1819_application, user: nil, status: nil
      assert application.valid?
    end
  end
end
