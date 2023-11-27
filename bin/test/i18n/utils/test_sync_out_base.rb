require_relative '../../test_helper'
require_relative '../../../i18n/utils/sync_out_base'

describe I18n::Utils::SyncOutBase do
  let(:described_class) {I18n::Utils::SyncOutBase}
  let(:described_instance) {described_class.new}

  let(:crowdin_locale) {'expected_crowdin_locale'}
  let(:language) {{crowdin_name_s: crowdin_locale}}

  let(:crowdin_locale_dir) {CDO.dir('i18n/locales', crowdin_locale)}

  before do
    I18nScriptUtils.stubs(:remove_empty_dir)
    PegasusLanguages.stubs(:all).returns([language])
  end

  describe '.perform' do
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
    it 'calls `#process` foe each language and then removes empty Crowdin locale dir' do
      execution_sequence = sequence('execution')

      described_instance.expects(:process).with(language).in_sequence(execution_sequence)
      I18nScriptUtils.expects(:remove_empty_dir).with(crowdin_locale_dir).in_sequence(execution_sequence)

      described_instance.send(:perform)
    end
  end
end
