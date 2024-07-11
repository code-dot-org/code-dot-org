require_relative '../../../../test_helper'
require_relative '../../../../../i18n/resources/dashboard/text_to_speech/sync_out'

describe I18n::Resources::Dashboard::TextToSpeech::SyncOut do
  let(:described_class) {I18n::Resources::Dashboard::TextToSpeech::SyncOut}
  let(:described_instance) {described_class.new}

  let(:locale) {'uk-UA'}

  around do |test|
    DatabaseCleaner.start
    FakeFS.with_fresh {test.call}
    DatabaseCleaner.clean
  end

  before do
    Level.any_instance.stubs(:tts_upload_to_s3)
  end

  it 'inherits from I18n::Utils::SyncOutBase' do
    assert_equal I18n::Utils::SyncOutBase, described_class.superclass
  end

  describe 'TTS_LOCALES' do
    it 'returns TextToSpeech VOICES keys excluding :en-US' do
      _(described_class::TTS_LOCALES).must_equal %i[es-ES es-MX it-IT pt-BR]
    end
  end

  describe '#perform' do
    let(:perform_sync_out) {described_instance.perform}

    let(:unit_tts_enabled) {true}
    let(:unit_is_csf_international) {false}
    let(:unit_is_twenty_hour) {false}
    let(:unit) {FactoryBot.create(:unit, tts: unit_tts_enabled)}
    let(:level) {FactoryBot.create(:applab)}

    let(:expect_tts_short_instructions_l10n_uploading) do
      described_instance.expects(:upload_tts_short_instructions_l10n).with(level, locale)
    end
    let(:expect_tts_long_instructions_l10n_uploading) do
      described_instance.expects(:upload_tts_long_instructions_l10n).with(level, locale)
    end
    let(:expect_tts_authored_hints_l10n_uploading) do
      described_instance.expects(:upload_tts_authored_hints_l10n).with(level, locale)
    end

    around do |test|
      described_class.stub_const(:TTS_LOCALES, [locale]) {test.call}
    end

    before do
      Level.destroy_all
      Unit.destroy_all

      script_level = FactoryBot.create(:script_level, script: unit, levels: [level])
      FactoryBot.create(:lesson_group, script: script_level.script, lessons: [script_level.lesson])

      Unit.any_instance.stubs(:csf_international?).returns(unit_is_csf_international)
      Unit.any_instance.stubs(:twenty_hour?).returns(unit_is_twenty_hour)
    end

    it 'uploads the unit Blockly levels TTS localizations to S3' do
      expect_tts_short_instructions_l10n_uploading.once
      expect_tts_long_instructions_l10n_uploading.once
      expect_tts_authored_hints_l10n_uploading.once

      perform_sync_out
    end

    context 'when the unit is csf international' do
      let(:unit_is_csf_international) {true}

      it 'does not upload the Blockly level TTS "long_instructions" localization to S3' do
        expect_tts_long_instructions_l10n_uploading.never
        perform_sync_out
      end
    end

    context 'when the unit is "20-hour"' do
      let(:unit_is_twenty_hour) {true}

      it 'does not upload the Blockly level TTS "long_instructions" localization to S3' do
        expect_tts_long_instructions_l10n_uploading.never
        perform_sync_out
      end
    end

    context 'when the level is not Blockly' do
      let(:level) {FactoryBot.create(:weblab)}

      it 'does not upload the unit Blockly levels TTS localizations to S3' do
        expect_tts_short_instructions_l10n_uploading.never
        expect_tts_long_instructions_l10n_uploading.never
        expect_tts_authored_hints_l10n_uploading.never

        perform_sync_out
      end
    end

    context 'when the unit TTS is disabled' do
      let(:unit_tts_enabled) {false}

      it 'does not upload the unit Blockly levels TTS localizations to S3' do
        described_instance.expects(:upload_tts_short_instructions_l10n).with(level).never
        described_instance.expects(:upload_tts_long_instructions_l10n).with(level).never
        described_instance.expects(:upload_tts_authored_hints_l10n).with(level).never

        perform_sync_out
      end
    end
  end

  describe '#upload_tts_short_instructions_l10n' do
    let(:upload_level_tts_short_instructions_l10n) do
      described_instance.send(:upload_tts_short_instructions_l10n, level, locale)
    end

    let(:level_short_instructions) {'expected_level_short_instructions'}
    let(:level_tts_short_instructions) {'expected_level_tts_short_instructions'}
    let(:level_tts_short_instructions_l10n) {'expected_level_tts_short_instructions_l10n'}

    let(:level) {FactoryBot.build_stubbed(:level, short_instructions: level_short_instructions)}

    before do
      level.stubs(:tts_short_instructions_text).with(locale: locale).returns(level_tts_short_instructions_l10n)
      TextToSpeech.stubs(:sanitize).with(level_short_instructions).returns(level_tts_short_instructions)
    end

    it 'uploads the level TTS "short_instructions" localization to S3' do
      level.expects(:tts_upload_to_s3).with(level_tts_short_instructions_l10n, 'short_instructions', 'update_level_i18n', locale: locale).once
      upload_level_tts_short_instructions_l10n
    end

    context 'when the level TTS "short_instructions" is not localized' do
      let(:level_tts_short_instructions_l10n) {level_tts_short_instructions}

      it 'does not try to upload the localization to S3' do
        level.expects(:tts_upload_to_s3).never
        upload_level_tts_short_instructions_l10n
      end
    end

    context 'when the level TTS "short_instructions" localization is empty' do
      let(:level_tts_short_instructions_l10n) {''}

      it 'does not upload the localization to S3' do
        level.expects(:tts_upload_to_s3).never
        upload_level_tts_short_instructions_l10n
      end
    end
  end

  describe '#upload_tts_long_instructions_l10n' do
    let(:upload_level_tts_long_instructions_l10n) do
      described_instance.send(:upload_tts_long_instructions_l10n, level, locale)
    end

    let(:level_long_instructions) {'expected_level_long_instructions'}
    let(:level_tts_long_instructions) {'expected_level_tts_long_instructions'}
    let(:level_tts_long_instructions_l10n) {'expected_level_tts_long_instructions_l10n'}

    let(:level) {FactoryBot.build_stubbed(:level, long_instructions: level_long_instructions)}

    before do
      level.stubs(:tts_long_instructions_text).with(locale: locale).returns(level_tts_long_instructions_l10n)
      TextToSpeech.stubs(:sanitize).with(level_long_instructions).returns(level_tts_long_instructions)
    end

    it 'uploads the level TTS "long_instructions" localization to S3' do
      level.expects(:tts_upload_to_s3).with(level_tts_long_instructions_l10n, 'long_instructions', 'update_level_i18n', locale: locale).once
      upload_level_tts_long_instructions_l10n
    end

    context 'when the level TTS "long_instructions" is not localized' do
      let(:level_tts_long_instructions_l10n) {level_tts_long_instructions}

      it 'does not try to upload the localization to S3' do
        level.expects(:tts_upload_to_s3).never
        upload_level_tts_long_instructions_l10n
      end
    end

    context 'when the level TTS "long_instructions" localization is empty' do
      let(:level_tts_long_instructions_l10n) {''}

      it 'does not upload the localization to S3' do
        level.expects(:tts_upload_to_s3).never
        upload_level_tts_long_instructions_l10n
      end
    end
  end

  describe '#upload_tts_authored_hints_l10n' do
    let(:upload_level_tts_authored_hints_l10n) do
      described_instance.send(:upload_tts_authored_hints_l10n, level, locale)
    end

    let(:level_name) {'expected_level_name'}
    let(:level_authored_hint_id) {'expected_level_authored_hint_id'}
    let(:level_authored_hint_markdown) {"<xml>expected authored \n hint markdown</xml>"}
    let(:level_authored_hint_markdown_l10n) {"expected authored \n hint markdown #{locale} i10n"}
    let(:level_tts_authored_hint_markdown_l10n) {"#{level_authored_hint_markdown_l10n}\n"}
    let(:level_authored_hints) {['hint_id' => level_authored_hint_id, 'hint_markdown' => level_authored_hint_markdown]}
    let(:level) {FactoryBot.build_stubbed(:level, name: level_name, authored_hints: JSON.dump(level_authored_hints))}

    let(:localizations) do
      {
        'data' => {
          'authored_hints' => {
            level_name => {
              level_authored_hint_id => "<xml>#{level_authored_hint_markdown_l10n}</xml>"
            }
          }
        }
      }
    end

    before do
      I18n.backend.store_translations(locale, localizations)
      level.stubs(:should_localize?).returns(true)
    end

    it 'uploads the level TTS "authored_hints" localization to S3' do
      level.expects(:tts_upload_to_s3).with(level_tts_authored_hint_markdown_l10n, 'hint_markdown', 'update_level_i18n', locale: locale)
      upload_level_tts_authored_hints_l10n
    end

    context 'when the level TTS "authored_hints" is not localized' do
      let(:level_authored_hint_markdown_l10n) {level_authored_hint_markdown}

      it 'does not try to upload the localization to S3' do
        level.expects(:tts_upload_to_s3).never
        upload_level_tts_authored_hints_l10n
      end
    end

    context 'when the level TTS "authored_hints" localization is empty' do
      let(:level_authored_hint_markdown_l10n) {''}

      it 'does not upload the localization to S3' do
        level.expects(:tts_upload_to_s3).never
        upload_level_tts_authored_hints_l10n
      end
    end

    context 'when the level "authored_hints" localization does not exist' do
      before do
        level.expects(:localized_authored_hints).returns(nil)
      end

      it 'does not upload the localization to S3' do
        level.expects(:tts_upload_to_s3).never
        upload_level_tts_authored_hints_l10n
      end
    end
  end
end
