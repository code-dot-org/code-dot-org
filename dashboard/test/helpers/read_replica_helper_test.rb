require 'test_helper'

class ReadReplicaHelperTest < ActiveSupport::TestCase
  test 'read_curriculum reads from a reader database instance' do
    Rails.application.config.stubs(:levelbuilder_mode).returns(false)
    ActiveRecord::Base.expects(:connected_to).with(role: :reading).yields.returns(:read_from_replica)

    result = ReadReplicaHelper.read_curriculum {:read_from_writer}

    assert_equal :read_from_replica, result
  end

  test 'read_curriculum reads from the writer on levelbuilder' do
    Rails.application.config.stubs(:levelbuilder_mode).returns(true)
    # An author reads back curriculum they just wrote, so replication lag would show them stale content.
    ActiveRecord::Base.expects(:connected_to).never

    result = ReadReplicaHelper.read_curriculum {:read_from_writer}

    assert_equal :read_from_writer, result
  end

  test 'read_curriculum returns the block value' do
    Rails.application.config.stubs(:levelbuilder_mode).returns(false)

    result = ReadReplicaHelper.read_curriculum {42}

    assert_equal 42, result
  end
end
