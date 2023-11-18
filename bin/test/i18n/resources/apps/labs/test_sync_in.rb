require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/labs/sync_in'

describe I18n::Resources::Apps::Labs::SyncIn do
  let(:described_class) {I18n::Resources::Apps::Labs::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:process) {described_instance.process}

    it 'prepares i18n source files' do
      execution_sequence = sequence('execution')

      described_instance.expects(:prepare_i18n_source_files).in_sequence(execution_sequence)
      described_instance.expects(:redact_i18n_source_files).in_sequence(execution_sequence)

      process
    end
  end

  describe '#prepare_i18n_source_files' do
    let(:prepare_i18n_source_files) {described_instance.send(:prepare_i18n_source_files)}

    it 'copies `apps/i18n/{lab}/en_us.json` files to `i18n/locales/source/blockly-mooc/{lab}.json`' do
      apps_i18n_lab_path = CDO.dir(File.join('apps/i18n/expected_test_lab/en_us.json'))

      FileUtils.mkdir_p(File.dirname(apps_i18n_lab_path))
      FileUtils.touch(apps_i18n_lab_path)

      prepare_i18n_source_files

      assert File.exist?(CDO.dir(File.join("i18n/locales/source/blockly-mooc/expected_test_lab.json")))
    end

    it 'replaces the fish lab file with `@code-dot-org/ml-activities/i18n/oceans.json`' do
      i18n_source_file_path = CDO.dir('i18n/locales/source/blockly-mooc/fish.json')

      apps_i18n_fish_lab_path = CDO.dir(File.join('apps/i18n/fish/en_us.json'))
      FileUtils.mkdir_p(File.dirname(apps_i18n_fish_lab_path))
      File.write(apps_i18n_fish_lab_path, 'fish_lab_translations')
      prepare_i18n_source_files
      assert File.exist?(i18n_source_file_path)
      assert_equal 'fish_lab_translations', File.read(i18n_source_file_path)

      apps_i18n_oceans_lab_path = CDO.dir('apps/node_modules/@code-dot-org/ml-activities/i18n/oceans.json')
      FileUtils.mkdir_p(File.dirname(apps_i18n_oceans_lab_path))
      File.write(apps_i18n_oceans_lab_path, 'oceans_lab_translations')
      described_instance.send(:prepare_i18n_source_files)
      assert File.exist?(i18n_source_file_path)
      assert_equal 'oceans_lab_translations', File.read(i18n_source_file_path)
    end
  end

  describe '#redact_i18n_source_files' do
    let(:redact_i18n_source_files) {described_instance.send(:redact_i18n_source_files)}

    let(:redact_labs) {%w[applab gamelab weblab]}

    let(:i18n_source_file_path) {CDO.dir(File.join("i18n/locales/source/blockly-mooc/#{lab}.json"))}
    let(:i18n_backup_file_path) {CDO.dir(File.join("i18n/locales/original/blockly-mooc/#{lab}.json"))}

    let(:expect_i18n_source_file_backuping) {RedactRestoreUtils.expects(:backup_source_file).with(i18n_source_file_path)}
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
          redact_i18n_source_files
          assert File.exist?(i18n_backup_file_path)
        end

        it 'redacts the source file' do
          execution_sequence = sequence('execution')

          expect_i18n_source_file_backuping.in_sequence(execution_sequence)
          expect_i18n_source_file_redaction.in_sequence(execution_sequence)

          redact_i18n_source_files
        end
      end
    end

    context 'when the lab is unredactable' do
      let(:lab) {'unredactable'}

      it 'does not backup and redact the source file' do
        expect_i18n_source_file_backuping.never
        expect_i18n_source_file_redaction.never

        redact_i18n_source_files

        refute File.exist?(i18n_backup_file_path)
      end
    end
  end
end
