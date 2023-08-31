require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/animations/sync_in'

describe I18n::Resources::Apps::Animations::SyncIn do
  def around
    FakeFS.with_fresh {yield}
  end

  before do
    STDOUT.stubs(:print)
  end

  describe '.perform' do
    it 'sync-in animations' do
      ManifestBuilder.expects(new: mock(get_animation_strings: {test: 'example'})).with({spritelab: true, quiet: true}).once

      I18n::Resources::Apps::Animations::SyncIn.perform

      assert_equal %Q[{\n  "test": "example"\n}], File.read(CDO.dir('i18n/locales/source/animations/spritelab_animation_library.json'))
    end
  end
end
