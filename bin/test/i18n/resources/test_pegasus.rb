require_relative '../../test_helper'
require_relative '../../../i18n/resources/pegasus'

describe I18n::Resources::Pegasus do
  describe '.sync_in' do
    it 'sync-in Pegasus resources' do
      execution_sequence = sequence('execution')

      I18n::Resources::Pegasus::HourOfCode.expects(:sync_in).in_sequence(execution_sequence)
      I18n::Resources::Pegasus::Markdown.expects(:sync_in).in_sequence(execution_sequence)

      # Copying Pegasus source file
      I18nScriptUtils.expects(:fix_yml_file).with(CDO.dir('pegasus/cache/i18n/en-US.yml')).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:copy_file).with(CDO.dir('pegasus/cache/i18n/en-US.yml'), CDO.dir('i18n/locales/source/pegasus/mobile.yml')).in_sequence(execution_sequence)

      I18n::Resources::Pegasus.sync_in
    end
  end

  describe '.sync_out' do
    it 'sync-out Pegasus resources' do
      execution_sequence = sequence('execution')

      I18n::Resources::Pegasus::HourOfCode.expects(:sync_out).in_sequence(execution_sequence)
      I18n::Resources::Pegasus::Markdown.expects(:sync_out).in_sequence(execution_sequence)

      I18n::Resources::Pegasus.sync_out
    end
  end
end
