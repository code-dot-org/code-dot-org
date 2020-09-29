require 'test_helper'

class ResourceTest < ActiveSupport::TestCase
  test "can create resource" do
    resource = create :resource, key: 'my key'
    assert_equal 'my key', resource.key
  end
end
