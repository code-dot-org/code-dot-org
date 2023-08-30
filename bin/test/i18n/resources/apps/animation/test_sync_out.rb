require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/animations/sync_out'

class I18n::Resources::Apps::Animations::SyncOutTest < Minitest::Test
  def setup
    STDOUT.stubs(:print)
  end

  def test_performing
    I18n::Resources::Apps::Animations::SyncOut.any_instance.expects(:execute).once

    I18n::Resources::Apps::Animations::SyncOut.perform
  end

  def test_execution
    PegasusLanguages.stub(:get_crowdin_name_and_locale, [{crowdin_name_s: 'Not English', locale_s: 'not-EN'}]) do
      exec_seq = sequence('execution')

      expected_crowdin_spritelab_file_path = CDO.dir('i18n/locales/Not English/animations/spritelab_animation_library.json')
      expected_i18n_spritelab_file_path = CDO.dir('i18n/locales/not-EN/animations/spritelab_animation_library.json')

      expected_manifest_builder = stub
      ManifestBuilder.expects(:new).with({spritelab: true, upload_to_s3: true, quiet: true}).in_sequence(exec_seq).returns(expected_manifest_builder)
      expected_manifest_builder.expects(:initial_animation_metadata).in_sequence(exec_seq)

      File.expects(:exist?).with(expected_crowdin_spritelab_file_path).in_sequence(exec_seq).returns(true)

      FileUtils.expects(:mv).with(expected_crowdin_spritelab_file_path, expected_i18n_spritelab_file_path, force: true).in_sequence(exec_seq).returns(true)
      FileUtils.expects(:rm_r).with(CDO.dir('i18n/locales/Not English/animations')).in_sequence(exec_seq).returns(true)

      I18nScriptUtils.expects(:to_js_locale).with('not-EN').in_sequence(exec_seq).returns('expected_js_locale')
      JSON.expects(:load_file).with(expected_i18n_spritelab_file_path).in_sequence(exec_seq).returns('expected_translations')
      expected_manifest_builder.expects(:upload_localized_manifest).with('expected_js_locale', 'expected_translations').in_sequence(exec_seq)

      I18n::Resources::Apps::Animations::SyncOut.new.execute
    end
  end

  def test_execution_for_us_english_locale
    PegasusLanguages.stub(:get_crowdin_name_and_locale, [{crowdin_name_s: 'English', locale_s: 'en-US'}]) do
      exec_seq = sequence('execution')

      expected_crowdin_spritelab_file_path = CDO.dir('i18n/locales/English/animations/spritelab_animation_library.json')
      expected_i18n_spritelab_file_path = CDO.dir('i18n/locales/en-US/animations/spritelab_animation_library.json')

      expected_manifest_builder = stub
      ManifestBuilder.expects(:new).with({spritelab: true, upload_to_s3: true, quiet: true}).in_sequence(exec_seq).returns(expected_manifest_builder)
      expected_manifest_builder.expects(:initial_animation_metadata).in_sequence(exec_seq)

      File.expects(:exist?).with(expected_crowdin_spritelab_file_path).in_sequence(exec_seq).returns(true)

      FileUtils.expects(:mv).with(expected_crowdin_spritelab_file_path, expected_i18n_spritelab_file_path, force: true).in_sequence(exec_seq).returns(true)
      FileUtils.expects(:rm_r).with(CDO.dir('i18n/locales/English/animations')).in_sequence(exec_seq).returns(true)

      I18nScriptUtils.expects(:to_js_locale).with('en-US').never.returns('expected_js_locale')
      JSON.expects(:load_file).with(expected_i18n_spritelab_file_path).never.returns('expected_translations')
      expected_manifest_builder.expects(:upload_localized_manifest).with('expected_js_locale', 'expected_translations').never

      I18n::Resources::Apps::Animations::SyncOut.new.execute
    end
  end

  def test_execution_with_non_existing_crowdin_spritelab_file
    PegasusLanguages.stub(:get_crowdin_name_and_locale, [{crowdin_name_s: 'Not English', locale_s: 'not-EN'}]) do
      exec_seq = sequence('execution')

      expected_crowdin_spritelab_file_path = CDO.dir('i18n/locales/Not English/animations/spritelab_animation_library.json')
      expected_i18n_spritelab_file_path = CDO.dir('i18n/locales/not-EN/animations/spritelab_animation_library.json')

      expected_manifest_builder = stub
      ManifestBuilder.expects(:new).with({spritelab: true, upload_to_s3: true, quiet: true}).in_sequence(exec_seq).returns(expected_manifest_builder)
      expected_manifest_builder.expects(:initial_animation_metadata).in_sequence(exec_seq)

      File.expects(:exist?).with(expected_crowdin_spritelab_file_path).in_sequence(exec_seq).returns(false)

      FileUtils.expects(:mv).with(expected_crowdin_spritelab_file_path, expected_i18n_spritelab_file_path, force: true).never.returns(true)
      FileUtils.expects(:rm_r).with(CDO.dir('i18n/locales/Not English/animations')).never.returns(true)

      I18nScriptUtils.expects(:to_js_locale).with('not-EN').never.returns('expected_js_locale')
      JSON.expects(:load_file).with(expected_i18n_spritelab_file_path).never.returns('expected_translations')
      expected_manifest_builder.expects(:upload_localized_manifest).with('expected_js_locale', 'expected_translations').never

      I18n::Resources::Apps::Animations::SyncOut.new.execute
    end
  end
end
