require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/pegasus/emails/sync_in'

describe I18n::Resources::Pegasus::Emails::SyncIn do
  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
    I18n::Utils::PegasusMarkdown.stubs(:sanitize_file_header)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Pegasus::Emails::SyncIn.any_instance.expects(:execute).once

      I18n::Resources::Pegasus::Emails::SyncIn.perform
    end
  end

  describe '#execute' do
    let(:sync_in) {I18n::Resources::Pegasus::Emails::SyncIn.new}

    before do
      FileUtils.mkdir_p(File.dirname(origin_emails_file_path))
      FileUtils.touch(origin_emails_file_path)
    end

    context 'when the origin email file is .md' do
      let(:origin_emails_file_subpath) {'public/test.md'}
      let(:origin_emails_file_path) {CDO.dir('pegasus/emails', origin_emails_file_subpath)}

      it 'prepares i18n source file' do
        I18n::Resources::Pegasus::Emails::SyncIn.stub_const(:LOCALIZABLE_FILE_SUBPATHS, [origin_emails_file_subpath]) do
          execution_sequence = sequence('execution')
          expected_i18n_source_file_path = CDO.dir('i18n/locales/source/emails/test.md')

          I18nScriptUtils.expects(:copy_file).with(origin_emails_file_path, expected_i18n_source_file_path).in_sequence(execution_sequence)
          I18n::Utils::PegasusMarkdown.expects(:sanitize_file_header).with(expected_i18n_source_file_path).in_sequence(execution_sequence)

          sync_in.execute
        end
      end
    end
  end
end
