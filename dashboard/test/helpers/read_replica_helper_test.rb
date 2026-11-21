require 'test_helper'

class ReadReplicaHelperTest < ActiveSupport::TestCase
  teardown do
    RequestStore.clear!
  end

  # The test environment defaults the Gatekeeper to allowing the replica, so these assert the override rather than
  # the default.
  test 'read_replica? follows the Gatekeeper by default' do
    Gatekeeper.stubs(:allows).with('dashboard_read_replica', default: true).returns(true)
    assert ActiveRecord::Base.read_replica?

    Gatekeeper.stubs(:allows).with('dashboard_read_replica', default: true).returns(false)
    refute ActiveRecord::Base.read_replica?
  end

  test 'read_replica? is false for a levelbuilder' do
    RequestStore.store[:current_user] = create(:levelbuilder)
    Gatekeeper.stubs(:allows).with('dashboard_read_replica', default: true).returns(true)

    refute ActiveRecord::Base.read_replica?
  end

  test 'read_replica? follows the Gatekeeper for other users' do
    RequestStore.store[:current_user] = create(:teacher)
    Gatekeeper.stubs(:allows).with('dashboard_read_replica', default: true).returns(true)

    assert ActiveRecord::Base.read_replica?
  end

  test 'the reading role resolves to the writer for a levelbuilder' do
    Gatekeeper.stubs(:allows).with('dashboard_read_replica', default: true).returns(true)

    ActiveRecord::Base.connected_to(role: :reading) do
      assert ActiveRecord::Base.connected_to?(role: :reading)
    end

    RequestStore.store[:current_user] = create(:levelbuilder)
    ActiveRecord::Base.connected_to(role: :reading) do
      assert ActiveRecord::Base.connected_to?(role: :writing)
    end
  end
end
