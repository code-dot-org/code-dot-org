require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/apps/animations/sync_out'

class I18n::Resources::Apps::Animations::SyncOutTest < Minitest::Test
  def setup
    I18n::Resources::Apps::Animations::SyncOut.stubs(:puts)
  end

  def test_performing
    expected_manifest_builder = stub

    ManifestBuilder.expects(:new).with({spritelab: true, upload_to_s3: true, quiet: true}).once.returns(expected_manifest_builder)

    PegasusLanguages.stub(:get_crowdin_name_and_locale, [{crowdin_name_s: 'Not English', locale_s: 'not-EN'}]) do
      exec_seq = sequence('execution')

      expected_crowdin_locale_dir = CDO.dir('i18n/locales/Not English/animations')
      expected_i18n_locale_dir = CDO.dir('i18n/locales/not-EN/animations')
      expected_i18n_file_path = CDO.dir('i18n/locales/not-EN/animations/spritelab_animation_library.json')

      File.expects(:directory?).with(expected_crowdin_locale_dir).in_sequence(exec_seq).returns(true)

      FileUtils.expects(:mkdir_p).with(expected_i18n_locale_dir).in_sequence(exec_seq)
      FileUtils.expects(:cp_r).with(File.join(expected_crowdin_locale_dir, '.'), expected_i18n_locale_dir).in_sequence(exec_seq)
      FileUtils.expects(:rm_r).with(expected_crowdin_locale_dir).in_sequence(exec_seq)

      Dir.expects(:[]).with(File.join(expected_i18n_locale_dir, '**/*.json')).in_sequence(exec_seq).returns([expected_i18n_file_path])
      I18nScriptUtils.expects(:file_changed?).with('not-EN', '/animations/spritelab_animation_library.json').in_sequence(exec_seq).returns(true)
      I18nScriptUtils.expects(:to_js_locale).with('not-EN').in_sequence(exec_seq).returns('expected_js_locale')
      JSON.expects(:load_file).with(expected_i18n_file_path).in_sequence(exec_seq).returns('expected_translations')
      expected_manifest_builder.expects(:upload_localized_manifest).with('expected_js_locale', 'expected_translations').in_sequence(exec_seq)

      I18n::Resources::Apps::Animations::SyncOut.perform
    end
  end

  def test_performing_for_us_english_locale
    expected_manifest_builder = stub

    ManifestBuilder.expects(:new).with({spritelab: true, upload_to_s3: true, quiet: true}).once.returns(expected_manifest_builder)

    PegasusLanguages.stub(:get_crowdin_name_and_locale, [{crowdin_name_s: 'English', locale_s: 'en-US'}]) do
      exec_seq = sequence('execution')

      expected_crowdin_locale_dir = CDO.dir('i18n/locales/English/animations')
      expected_i18n_locale_dir = CDO.dir('i18n/locales/en-US/animations')
      expected_i18n_file_path = CDO.dir('i18n/locales/en-US/animations/spritelab_animation_library.json')

      File.expects(:directory?).with(expected_crowdin_locale_dir).in_sequence(exec_seq).returns(true)
      FileUtils.expects(:mkdir_p).with(expected_i18n_locale_dir).in_sequence(exec_seq)
      FileUtils.expects(:cp_r).with(File.join(expected_crowdin_locale_dir, '.'), expected_i18n_locale_dir).in_sequence(exec_seq)
      FileUtils.expects(:rm_r).with(expected_crowdin_locale_dir).in_sequence(exec_seq)

      Dir.expects(:[]).with(File.join(expected_i18n_locale_dir, '**/*.json')).never.returns([expected_i18n_file_path])
      I18nScriptUtils.expects(:file_changed?).with('en-US', '/animations/spritelab_animation_library.json').never.returns(true)
      I18nScriptUtils.expects(:to_js_locale).with('en-US').never.returns('expected_js_locale')
      JSON.expects(:load_file).with(expected_i18n_file_path).never.returns('expected_translations')
      expected_manifest_builder.expects(:upload_localized_manifest).with('expected_js_locale', 'expected_translations').never

      I18n::Resources::Apps::Animations::SyncOut.perform
    end
  end

  def test_performing_with_changed_file
    expected_manifest_builder = stub

    ManifestBuilder.expects(:new).with({spritelab: true, upload_to_s3: true, quiet: true}).once.returns(expected_manifest_builder)

    PegasusLanguages.stub(:get_crowdin_name_and_locale, [{crowdin_name_s: 'Not English', locale_s: 'not-EN'}]) do
      exec_seq = sequence('execution')

      expected_crowdin_locale_dir = CDO.dir('i18n/locales/Not English/animations')
      expected_i18n_locale_dir = CDO.dir('i18n/locales/not-EN/animations')
      expected_i18n_file_path = CDO.dir('i18n/locales/not-EN/animations/spritelab_animation_library.json')

      File.expects(:directory?).with(expected_crowdin_locale_dir).in_sequence(exec_seq).returns(true)
      FileUtils.expects(:mkdir_p).with(expected_i18n_locale_dir).in_sequence(exec_seq)
      FileUtils.expects(:cp_r).with(File.join(expected_crowdin_locale_dir, '.'), expected_i18n_locale_dir).in_sequence(exec_seq)
      FileUtils.expects(:rm_r).with(expected_crowdin_locale_dir).in_sequence(exec_seq)
      Dir.expects(:[]).with(File.join(expected_i18n_locale_dir, '**/*.json')).in_sequence(exec_seq).returns([expected_i18n_file_path])
      I18nScriptUtils.expects(:file_changed?).with('not-EN', '/animations/spritelab_animation_library.json').in_sequence(exec_seq).returns(false)

      I18nScriptUtils.expects(:to_js_locale).with('not-EN').never.returns('expected_js_locale')
      JSON.expects(:load_file).with(expected_i18n_file_path).never.returns('expected_translations')
      expected_manifest_builder.expects(:upload_localized_manifest).with('expected_js_locale', 'expected_translations').never

      I18n::Resources::Apps::Animations::SyncOut.perform
    end
  end

  def test_performing_with_non_existing_crowdin_locale_dir
    expected_manifest_builder = stub

    ManifestBuilder.expects(:new).with({spritelab: true, upload_to_s3: true, quiet: true}).once.returns(expected_manifest_builder)

    PegasusLanguages.stub(:get_crowdin_name_and_locale, [{crowdin_name_s: 'Not English', locale_s: 'not-EN'}]) do
      exec_seq = sequence('execution')

      expected_crowdin_locale_dir = CDO.dir('i18n/locales/Not English/animations')
      expected_i18n_locale_dir = CDO.dir('i18n/locales/not-EN/animations')
      expected_i18n_file_path = CDO.dir('i18n/locales/not-EN/animations/spritelab_animation_library.json')

      File.expects(:directory?).with(expected_crowdin_locale_dir).in_sequence(exec_seq).returns(false)

      FileUtils.expects(:mkdir_p).with(expected_i18n_locale_dir).never
      FileUtils.expects(:cp_r).with(File.join(expected_crowdin_locale_dir, '.'), expected_i18n_locale_dir).never
      FileUtils.expects(:rm_r).with(expected_crowdin_locale_dir).never
      Dir.expects(:[]).with(File.join(expected_i18n_locale_dir, '**/*.json')).never.returns([expected_i18n_file_path])
      I18nScriptUtils.expects(:file_changed?).with('not-EN', '/animations/spritelab_animation_library.json').never.returns(true)
      I18nScriptUtils.expects(:to_js_locale).with('not-EN').never.returns('expected_js_locale')
      JSON.expects(:load_file).with(expected_i18n_file_path).never.returns('expected_translations')
      expected_manifest_builder.expects(:upload_localized_manifest).with('expected_js_locale', 'expected_translations').never

      I18n::Resources::Apps::Animations::SyncOut.perform
    end
  end
end
