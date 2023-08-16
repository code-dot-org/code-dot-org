require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/apps/labs'

class I18n::Resources::Apps::LabsTest < Minitest::Test
  def test_sync_in
    exec_seq = sequence('execution')

    # Preparation of i18n source files
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/blockly-mooc')).in_sequence(exec_seq)
    Dir.expects(:[]).with(CDO.dir('apps/i18n/**/en_us.json')).returns(['apps/i18n/expected_lab/en_us.json']).in_sequence(exec_seq)
    FileUtils.expects(:cp).with('apps/i18n/expected_lab/en_us.json', CDO.dir('i18n/locales/source/blockly-mooc/expected_lab.json')).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('apps/node_modules/@code-dot-org/ml-activities/i18n/oceans.json'), CDO.dir('i18n/locales/source/blockly-mooc/fish.json')).in_sequence(exec_seq)

    # Redaction of applab i18n source file
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/original/blockly-mooc')).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('i18n/locales/source/blockly-mooc/applab.json'), CDO.dir('i18n/locales/original/blockly-mooc/applab.json')).in_sequence(exec_seq)
    RedactRestoreUtils.expects(:redact).with(CDO.dir('i18n/locales/source/blockly-mooc/applab.json'), CDO.dir('i18n/locales/source/blockly-mooc/applab.json'), %w[link]).in_sequence(exec_seq)

    # Redaction of gamelab i18n source file
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/original/blockly-mooc')).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('i18n/locales/source/blockly-mooc/gamelab.json'), CDO.dir('i18n/locales/original/blockly-mooc/gamelab.json')).in_sequence(exec_seq)
    RedactRestoreUtils.expects(:redact).with(CDO.dir('i18n/locales/source/blockly-mooc/gamelab.json'), CDO.dir('i18n/locales/source/blockly-mooc/gamelab.json'), %w[link]).in_sequence(exec_seq)

    # Redaction of weblab i18n source file
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/original/blockly-mooc')).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('i18n/locales/source/blockly-mooc/weblab.json'), CDO.dir('i18n/locales/original/blockly-mooc/weblab.json')).in_sequence(exec_seq)
    RedactRestoreUtils.expects(:redact).with(CDO.dir('i18n/locales/source/blockly-mooc/weblab.json'), CDO.dir('i18n/locales/source/blockly-mooc/weblab.json'), %w[link]).in_sequence(exec_seq)

    I18n::Resources::Apps::Labs.sync_in
  end
end
