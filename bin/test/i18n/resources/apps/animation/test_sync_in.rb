require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/animations/sync_in'

describe I18n::Resources::Apps::Animations::SyncIn do
  let(:described_class) {I18n::Resources::Apps::Animations::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:process) {described_instance.process}

    let(:i18n_source_file_path) {CDO.dir('i18n/locales/source/animations/spritelab_animation_library.json')}

    it 'prepares the i18n source file' do
      ManifestBuilder.expects(new: mock(get_animation_strings: {animation_key: 'animation_val'})).with({spritelab: true, quiet: true}).once

      process

      assert_equal %Q[{\n  "animation_key": "animation_val"\n}], File.read(i18n_source_file_path)
    end
  end
end
