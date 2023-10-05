require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/labs/sync_in'

describe I18n::Resources::Apps::Labs::SyncIn do
  let(:sync_in) {I18n::Resources::Apps::Labs::SyncIn.new}

  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
  end

  describe '.perform' do
    it 'calls #execute' do
      I18n::Resources::Apps::Labs::SyncIn.any_instance.expects(:execute).once

      I18n::Resources::Apps::Labs::SyncIn.perform
    end
  end

  describe '#execute' do
    describe 'i18n source files preparation' do
      it 'copies `apps/i18n/{lab}/en_us.json` files to `i18n/locales/source/blockly-mooc/{lab}.json`' do
        apps_i18n_lab_path = CDO.dir(File.join('apps/i18n/expected_test_lab/en_us.json'))

        FileUtils.mkdir_p(File.dirname(apps_i18n_lab_path))
        FileUtils.touch(apps_i18n_lab_path)

        sync_in.execute

        assert File.exist?(CDO.dir(File.join("i18n/locales/source/blockly-mooc/expected_test_lab.json")))
      end

      it 'replaces the fish lab file with `@code-dot-org/ml-activities/i18n/oceans.json`' do
        i18n_source_file_path = CDO.dir('i18n/locales/source/blockly-mooc/fish.json')

        apps_i18n_fish_lab_path = CDO.dir(File.join('apps/i18n/fish/en_us.json'))
        FileUtils.mkdir_p(File.dirname(apps_i18n_fish_lab_path))
        File.write(apps_i18n_fish_lab_path, 'fish_lab_translations')
        sync_in.execute
        assert File.exist?(i18n_source_file_path)
        assert_equal 'fish_lab_translations', File.read(i18n_source_file_path)

        apps_i18n_oceans_lab_path = CDO.dir('apps/node_modules/@code-dot-org/ml-activities/i18n/oceans.json')
        FileUtils.mkdir_p(File.dirname(apps_i18n_oceans_lab_path))
        File.write(apps_i18n_oceans_lab_path, 'oceans_lab_translations')
        sync_in.execute
        assert File.exist?(i18n_source_file_path)
        assert_equal 'oceans_lab_translations', File.read(i18n_source_file_path)
      end
    end

    describe 'i18n source files redaction' do
      let(:redact_labs) {%w[applab gamelab weblab]}

      let(:i18n_source_file_path) {CDO.dir(File.join("i18n/locales/source/blockly-mooc/#{lab}.json"))}
      let(:i18n_backup_file_path) {CDO.dir(File.join("i18n/locales/original/blockly-mooc/#{lab}.json"))}

      let(:expect_i18n_source_file_backuping) {FileUtils.expects(:cp).with(i18n_source_file_path, i18n_backup_file_path)}
      let(:expect_i18n_source_file_redaction) {RedactRestoreUtils.expects(:redact).with(i18n_source_file_path, i18n_source_file_path, %w[link])}

      before do
        RedactRestoreUtils.stubs(:redact)

        FileUtils.mkdir_p(File.dirname(i18n_source_file_path))
        FileUtils.touch(i18n_source_file_path)
      end

      I18n::Resources::Apps::Labs::REDACTABLE_LABS.each do |redact_lab|
        context "when the lab is `#{redact_lab}`" do
          let(:lab) {redact_lab}

          it 'backups the source file' do
            sync_in.execute
            assert File.exist?(i18n_backup_file_path)
          end

          it 'redacts the source file' do
            execution_sequence = sequence('execution')

            expect_i18n_source_file_backuping.in_sequence(execution_sequence)
            expect_i18n_source_file_redaction.in_sequence(execution_sequence)

            sync_in.execute
          end
        end
      end

      context 'when the lab is unredactable' do
        let(:lab) {'unredactable'}

        it 'does not backup and redact the source file' do
          expect_i18n_source_file_backuping.never
          expect_i18n_source_file_redaction.never

          sync_in.execute

          refute File.exist?(i18n_backup_file_path)
        end
      end
    end
  end
end
