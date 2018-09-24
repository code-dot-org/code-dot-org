require_relative '../../../shared/test/spy_newrelic_agent'
require 'test_helper'

class NewRelicTest < ActionDispatch::IntegrationTest
  test "should add custom attribute for signed in user" do
    student = create :student
    ::NewRelic::Agent.expects(:add_custom_attributes).with({user_id: student.id})
    sign_in student
    get '/'
  end
end
