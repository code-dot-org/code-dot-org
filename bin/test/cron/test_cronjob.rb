require_relative '../test_helper'
require 'cdo/sentry'

BIN_DIR = File.expand_path('../../', __dir__)
BIN_CRONJOB_PATH = File.join(BIN_DIR, 'cronjob')

describe 'bin/cronjob' do
  it 'can run the true command' do
    success = system("#{BIN_CRONJOB_PATH} true")
    assert success, 'Expected `bin/cronjob true` to return 0'
  end

  it 'notifies honeybadger if cronjob returns status 1' do
    Honeybadger.expects(:notify).with(has_entry(:error_class, 'cronjob exit 1 returned 1')).once
    bin_cronjob(command: 'exit 1')
  end

  it 'does not notify honeybadger if cronjob returns status 0' do
    Honeybadger.expects(:notify).never
    bin_cronjob(command: 'exit 0')
  end

  it 'does not notify honeybadger if cronjob just prints to stderr' do
    Honeybadger.expects(:notify).never
    bin_cronjob(command: '>&2 echo hello_badger')
  end

  it 'passes stderr to honeybadger if cronjob fails' do
    Honeybadger.expects(:notify).with(has_entry(:error_message, "hello_badger\n")).once
    bin_cronjob(command: '>&2 echo hello_badger && exit 1')
  end

  describe 'with a Sentry monitor' do
    before do
      ENV['SENTRY_MONITOR_SLUG'] = 'demo'
      ENV['SENTRY_MONITOR_SCHEDULE'] = '*/5 * * * *'
      CDO.stubs(:enable_sentry).returns(true)
      CDO.stubs(:unit_test).returns(false)
      Sentry.stubs(:init)
      Honeybadger.stubs(:notify)
      Sentry.expects(:capture_check_in).with('demo', :in_progress, anything).returns('check-in-1')
    end

    after do
      ENV.delete('SENTRY_MONITOR_SLUG')
      ENV.delete('SENTRY_MONITOR_SCHEDULE')
    end

    it 'sends an ok check-in if cronjob returns status 0' do
      Sentry.expects(:capture_check_in).with('demo', :ok, has_entry(:check_in_id, 'check-in-1')).once
      Sentry.expects(:capture_message).never
      bin_cronjob(command: 'exit 0')
    end

    it 'sends an error check-in and an event carrying stderr if cronjob fails' do
      Sentry.expects(:capture_check_in).with('demo', :error, has_entry(:check_in_id, 'check-in-1')).once
      Sentry.expects(:capture_message).with(
        'cronjob >&2 echo hello_badger && exit 1 returned 1',
        has_entries(fingerprint: ['cronjob >&2 echo hello_badger && exit 1 returned 1'], extra: has_entry(:stderr, "hello_badger\n"))
      ).once
      bin_cronjob(command: '>&2 echo hello_badger && exit 1')
    end

    it 'reports the only_one guard aborting like any other failure' do
      Sentry.expects(:capture_check_in).with('demo', :error, has_entry(:check_in_id, 'check-in-1')).once
      Sentry.expects(:capture_message).with(anything, has_entry(:extra, has_entry(:stderr, "Script already running\n"))).once
      bin_cronjob(command: ">&2 echo 'Script already running' && exit 1")
    end
  end

  it 'sends no check-in without monitor variables' do
    Honeybadger.stubs(:notify)
    Sentry.expects(:capture_check_in).never
    bin_cronjob(command: 'exit 1')
  end

  before do
    @original_argv = ARGV.dup
  end

  after do
    ARGV.replace(@original_argv)
  end

  # We use load('bin/cronjob'), as opposed to system('bin/cronjob'), to run cronjob in-process.
  # This allows us to stub Honeybadger.notify and thereby verify its called/not-called.
  private def bin_cronjob(command:)
    ARGV.replace([command])
    load BIN_CRONJOB_PATH
  end
end
