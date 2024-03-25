require_relative '../../test_helper'
require_relative '../../../i18n/utils/sync_out_base'

describe I18n::Utils::SyncOutBase do
  let(:described_class) {SyncOutBaseTest = Class.new(I18n::Utils::SyncOutBase)}
  let(:described_instance) {described_class.new}

  let(:locale) {'expected_locale'}
  let(:language) {{locale_s: locale}}

  let(:crowdin_locale_dir) {CDO.dir('i18n/crowdin', locale)}

  before do
    I18nScriptUtils.stubs(:remove_empty_dir)
  end

  describe '.parse_options' do
    let(:parse_options) {described_class.parse_options}

    it 'returns parsed options' do
      parsed_options = {parsed: 'options'}

      I18nScriptUtils.expects(:parse_options).returns(parsed_options)

      _(parse_options).must_equal parsed_options
    end
  end

  describe '.perform' do
    before do
      described_class.any_instance.stubs(:process)
      I18n::Metrics.stubs(:report_runtime).yields(nil)
    end

    it 'calls `#perform`' do
      described_class.any_instance.expects(:process).once
      described_class.perform
    end

    it 'calls report_runtime metrics with class name' do
      I18n::Metrics.expects(:report_runtime).with(described_class.name, 'sync-out').once
      described_class.perform
    end

    it 'reports the runtime metric with ResourceParent::ResourceChild' do
      module I18n
        module Resources
          module ResourceParent
            module ResourceChild
              class SyncOut < I18n::Utils::SyncOutBase
              end
            end
          end
        end
      end

      I18n::Metrics.expects(:report_runtime).with('ResourceParent::ResourceChild', 'sync-out').once

      I18n::Resources::ResourceParent::ResourceChild::SyncOut.perform
    end
  end

  describe '#process' do
    it 'raises NotImplementedError' do
      assert_raises(NotImplementedError) {described_instance.send(:process, 'language')}
    end
  end

  describe '#perform' do
    let(:perform) {described_instance.send(:perform)}

    before do
      described_instance.stubs(:languages).returns([language])
    end

    it 'calls `#process` foe each language and then removes empty Crowdin locale dir' do
      execution_sequence = sequence('execution')

      described_instance.expects(:process).with(language).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:remove_empty_dir).with(crowdin_locale_dir).in_sequence(execution_sequence)

      perform
    end
  end

  describe '#languages' do
    let(:languages) {described_instance.send(:languages)}

    it 'returns CDO language records without the i18n source language' do
      source_language = {locale_s: I18nScriptUtils::SOURCE_LOCALE}

      I18nScriptUtils.expects(:cdo_languages).returns([source_language, language])

      _(languages).must_equal [language]
    end
  end
end
