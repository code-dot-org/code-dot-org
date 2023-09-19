require_relative '../../test_helper'
require_relative '../../../i18n/utils/sync_out_base'

describe I18n::Utils::SyncOutBase do
  before do
    I18nScriptUtils.stubs(:remove_empty_dir)
  end

  describe '.process' do
    TestSyncOutProcess = Class.new(I18n::Utils::SyncOutBase)

    it 'preserves `@process_block`' do
      assert_raises(NotImplementedError) {TestSyncOutProcess.send(:process_block).call('expected_language')}

      TestSyncOutProcess.send(:process) {|language| language}

      assert_equal 'expected_language', TestSyncOutProcess.send(:process_block).call('expected_language')
    end
  end

  describe '.perform' do
    TestSyncOutPerform = Class.new(I18n::Utils::SyncOutBase)
    let(:perform_sync_out) {TestSyncOutPerform.perform}

    let(:crowdin_locale) {'expected_crowdin_locale'}
    let(:language) {{crowdin_name_s: crowdin_locale}}

    before do
      I18n::Utils::SyncOutBase.any_instance.stubs(:languages).returns([language])
    end

    it 'executes `@process_block` per language and then removes the empty Crowdin locale dir`' do
      execution_sequence = sequence('execution')

      expected_process = proc {'expected_process'}
      TestSyncOutPerform.instance_variable_set(:@process_block, expected_process)

      TestSyncOutPerform.any_instance.expects(:instance_exec).with(language, &expected_process).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:remove_empty_dir).with(CDO.dir('i18n/locales', crowdin_locale)).in_sequence(execution_sequence)

      perform_sync_out
    end
  end

  describe '#languages' do
    let(:languages) {I18n::Utils::SyncOutBase.new.send(:languages)}

    it 'returns the list of pegasus language objects' do
      expected_languages = ['expected_language']

      PegasusLanguages.expects(:all).once.returns(expected_languages)

      assert_equal expected_languages, languages
    end
  end
end
