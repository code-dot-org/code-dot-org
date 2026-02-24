require_relative '../test_helper'

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
