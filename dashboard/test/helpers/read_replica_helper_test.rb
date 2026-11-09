require 'test_helper'

class ReadReplicaHelperTest < ActiveSupport::TestCase
  teardown do
    Current.reset
  end

  # The test environment defaults the Gatekeeper to allowing the replica, so these assert the override rather than
  # the default.
  test 'read_replica? follows the Gatekeeper by default' do
    Gatekeeper.stubs(:allows).with('dashboard_read_replica', default: true).returns(true)
    assert ActiveRecord::Base.read_replica?

    Gatekeeper.stubs(:allows).with('dashboard_read_replica', default: true).returns(false)
    refute ActiveRecord::Base.read_replica?
  end

  test 'read_replica? is false for a request that authors curriculum' do
    Gatekeeper.stubs(:allows).with('dashboard_read_replica', default: true).returns(true)
    Current.read_from_writer = true

    refute ActiveRecord::Base.read_replica?
  end

  test 'the reading role resolves to the writer for a request that authors curriculum' do
    Gatekeeper.stubs(:allows).with('dashboard_read_replica', default: true).returns(true)

    ActiveRecord::Base.connected_to(role: :reading) do
      assert ActiveRecord::Base.connected_to?(role: :reading)
    end

    Current.read_from_writer = true
    ActiveRecord::Base.connected_to(role: :reading) do
      assert ActiveRecord::Base.connected_to?(role: :writing)
    end
  end

  test 'read_from_writer does not outlive the unit of work that set it' do
    Current.read_from_writer = true
    Current.reset

    assert_nil Current.read_from_writer
  end
end
