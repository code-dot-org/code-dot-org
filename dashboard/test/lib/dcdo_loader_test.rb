require 'test_helper'
require 'dynamic_config/loaders/dcdo_loader'
require 'dynamic_config/dcdo'

class DCDOLoaderTest < ActiveSupport::TestCase
  test 'loading a valid gatekeeper yml file' do
    DCDOLoader.load("test/fixtures/dcdo.yaml")

    assert_equal DCDO.get('milestone_task_rate', default: 0), 1000
    assert_equal DCDO.get('some_numbers', default: []), [1, 8, 222332]
    assert_equal DCDO.get('a_hash', default: nil)['name'], 'trevor'
  end
end
