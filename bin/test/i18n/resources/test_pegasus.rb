require_relative '../../test_helper'
require_relative '../../../i18n/resources/pegasus'

class I18n::Resources::PegasusTest < Minitest::Test
  def test_sync_in
    exec_seq = sequence('execution')

    I18n::Resources::Pegasus::HourOfCode.expects(:sync_in).in_sequence(exec_seq)
    I18n::Resources::Pegasus::Markdown.expects(:sync_in).in_sequence(exec_seq)

    # Copying Pegasus source file
    FileUtils.expects(:mkdir_p).with(CDO.dir('i18n/locales/source/pegasus')).in_sequence(exec_seq)
    I18nScriptUtils.expects(:fix_yml_file).with(CDO.dir('pegasus/cache/i18n/en-US.yml')).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('pegasus/cache/i18n/en-US.yml'), CDO.dir('i18n/locales/source/pegasus/mobile.yml')).in_sequence(exec_seq)

    I18n::Resources::Pegasus.sync_in
  end
end
