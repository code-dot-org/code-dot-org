require_relative '../test_helper'
require 'cdo/statsig'

class StatsigInitializerTest < Minitest::Test
  def setup
    CDO.stubs(:rack_env?).returns(false)
    CDO.stubs(:rack_env).returns(:development)
    CDO.stubs(:managed_test_server?).returns(false)
    CDO.stubs(:statsig_server_secret_key).returns('secret-test')
    CDO.stubs(:preforking_parent?).returns(false)
  end

  def teardown
    Statsig.shutdown
  end

  def test_initializes_when_the_process_does_not_fork_workers
    Statsig.expects(:initialize)

    Cdo::StatsigInitializer.init
  end

  def test_skips_initialization_in_a_preforking_parent
    CDO.stubs(:preforking_parent?).returns(true)
    Statsig.expects(:initialize).never

    Cdo::StatsigInitializer.init
  end

  # The branch tests above assert that init is skipped; these assert the property
  # that actually matters, that no poller thread exists in a process that forks.
  # local_mode suppresses the network calls (statsig network.rb:91) but not the
  # threads (spec_store.rb:71-72), so this runs offline.
  def test_a_preforking_parent_spawns_no_statsig_threads
    CDO.stubs(:preforking_parent?).returns(true)

    before = Thread.list.size
    Cdo::StatsigInitializer.init

    assert_nil Statsig.instance_variable_get(:@shared_instance)
    assert_equal before, Thread.list.size
  end

  def test_a_worker_spawns_statsig_threads
    before = Thread.list.size
    Cdo::StatsigInitializer.init

    refute_nil Statsig.instance_variable_get(:@shared_instance)
    assert_operator Thread.list.size, :>, before
  end
end
