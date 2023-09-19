require_relative '../../test_helper'
require_relative '../../../i18n/utils/sync_out_base'

describe I18n::Utils::SyncOutBase do
  before do
    I18nScriptUtils.stubs(:remove_empty_dir)
  end

  describe '.process' do
    let(:define_instance_method_process) {I18n::Utils::SyncOutBase.process {|language| language}}

    it 'defines the instance method `#process`' do
      expected_language = 'expected_language'

      define_instance_method_process

      assert_equal expected_language, I18n::Utils::SyncOutBase.new.process(expected_language)
    end
  end

  describe '.perform' do
    let(:perform_sync_out) {I18n::Utils::SyncOutBase.perform}

    let(:crowdin_locale) {'expected_crowdin_locale'}
    let(:language) {{crowdin_name_s: crowdin_locale}}

    before do
      I18n::Utils::SyncOutBase.any_instance.stubs(:languages).returns([language])
    end

    it 'executes the sync-out `#process` per language and then removes the empty Crowdin locale dir' do
      execution_sequence = sequence('execution')

      I18n::Utils::SyncOutBase.any_instance.expects(:process).with(language).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:remove_empty_dir).with(CDO.dir('i18n/locales', crowdin_locale)).in_sequence(execution_sequence)

      perform_sync_out
    end
  end

  describe '#process' do
    it 'raises NotImplementedError' do
      assert_raises(NotImplementedError) {I18n::Utils::SyncOutBase.new.send(:process)}
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
