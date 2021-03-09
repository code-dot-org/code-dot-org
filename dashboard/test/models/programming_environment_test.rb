require 'test_helper'

class ProgrammingEnvironmentTest < ActiveSupport::TestCase
  test "can create programming environment" do
    programming_environment = create :programming_environment
    assert programming_environment.name
  end
end
