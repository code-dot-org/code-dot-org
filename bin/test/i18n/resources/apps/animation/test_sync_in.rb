require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/animations/sync_in'

class I18n::Resources::Apps::Animations::SyncInTest < Minitest::Test
  def setup
    STDOUT.stubs(:print)
  end

  def test_performing
    I18n::Resources::Apps::Animations::SyncIn.any_instance.expects(:execute)

    I18n::Resources::Apps::Animations::SyncIn.perform
  end

  def test_execution
    FakeFS.with_fresh do
      ManifestBuilder.expects(new: mock(get_animation_strings: {test: 'example'})).with({spritelab: true, quiet: true}).once

      I18n::Resources::Apps::Animations::SyncIn.new.execute

      assert_equal %Q[{\n  "test": "example"\n}], File.read(CDO.dir('i18n/locales/source/animations/spritelab_animation_library.json'))
    end
  end
end
