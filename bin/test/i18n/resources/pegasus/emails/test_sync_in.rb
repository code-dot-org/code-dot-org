require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/emails/sync_in'

describe I18n::Resources::Pegasus::Emails::SyncIn do
  let(:described_class) {I18n::Resources::Pegasus::Emails::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  before do
    STDOUT.stubs(:print)
    I18n::Utils::PegasusEmail.stubs(:sanitize_file_header)
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:run_process) {described_instance.process}

    before do
      FileUtils.mkdir_p(File.dirname(origin_emails_file_path))
      FileUtils.touch(origin_emails_file_path)
    end

    context 'when the origin email file is .md' do
      let(:origin_emails_file_subpath) {'test.md'}
      let(:origin_emails_file_path) {CDO.dir('pegasus/emails', origin_emails_file_subpath)}

      it 'prepares i18n source file' do
        I18n::Resources::Pegasus::Emails::SyncIn.stub_const(:LOCALIZABLE_FILE_SUBPATHS, [origin_emails_file_subpath]) do
          execution_sequence = sequence('execution')
          expected_i18n_source_file_path = CDO.dir('i18n/locales/source/pegasus/emails/test.md')

          I18nScriptUtils.expects(:copy_file).with(origin_emails_file_path, expected_i18n_source_file_path).in_sequence(execution_sequence)
          I18n::Utils::PegasusEmail.expects(:sanitize_file_header).with(expected_i18n_source_file_path).in_sequence(execution_sequence)

          run_process
        end
      end
    end
  end
end
