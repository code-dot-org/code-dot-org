require 'test_helper'

class LabTest < ActiveSupport::TestCase
  test "can create lab" do
    lab = create :lab, name: 'my-lab'
    assert_equal lab.name, 'my-lab'
  end
end
