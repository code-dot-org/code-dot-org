require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/musiclab_libraries/sync_in'

describe I18n::Resources::Apps::MusiclabLibraries::SyncIn do
  let(:described_class) {I18n::Resources::Apps::MusiclabLibraries::SyncIn}
  let(:described_instance) {described_class.new}

  around do |test|
    FakeFS.with_fresh {test.call}
  end

  it 'inherits from I18n::Utils::SyncInBase' do
    assert_equal I18n::Utils::SyncInBase, described_class.superclass
  end

  describe '#process' do
    let(:process) {described_instance.process}

    let(:i18n_source_file_path_intro) {CDO.dir('i18n/locales/source/musiclab_libraries/music-library-intro2024.json')}
    let(:i18n_source_file_path_launch_v2) {CDO.dir('i18n/locales/source/musiclab_libraries/music-library-launch2024.json')}

    it 'prepares the i18n source file' do
      described_instance.expects(:get_translation_strings).returns({'electro/drum_beat_edm': 'Drum Beat EDM'}).twice

      process

      assert_equal %Q[{\n  "electro/drum_beat_edm": "Drum Beat EDM"\n}], File.read(i18n_source_file_path_intro)
      assert_equal %Q[{\n  "electro/drum_beat_edm": "Drum Beat EDM"\n}], File.read(i18n_source_file_path_launch_v2)
    end
  end
end
