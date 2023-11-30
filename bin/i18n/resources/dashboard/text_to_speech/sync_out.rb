#!/usr/bin/env ruby

require 'json'

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../../../dashboard/app/models/concerns/text_to_speech'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../text_to_speech'

module I18n
  module Resources
    module Dashboard
      module TextToSpeech
        class SyncOut < I18n::Utils::SyncOutBase
          METRIC_CONTEXT = 'update_level_i18n'.freeze

          def perform
            progress_bar.start

            progress_bar.total = tts_units.size
            tts_units.find_each do |unit|
              next unless unit.text_to_speech_enabled?

              unit.levels.merge(Blockly.all).find_each do |level|
                I18nScriptUtils.process_in_threads(I18nScriptUtils::TTS_LOCALES) do |locale|
                  upload_tts_short_instructions_l10n(level, locale)
                  upload_tts_long_instructions_l10n(level, locale) unless unit.csf_international? || unit.twenty_hour?
                  upload_tts_authored_hints_l10n(level, locale)
                end
              end
            ensure
              progress_bar.increment
            end

            progress_bar.finish
          end

          private

          def tts_units
            @tts_units ||= Unit.tts_enabled
          end

          def sanitize_tts(text)
            ::TextToSpeech.sanitize(text || '')
          end

          def squash(value)
            case value
            when String then value.gsub(/\s+/, '')
            when Array then clean(value.join)
            when Hash then clean(value.values)
            else ''
            end
          end

          def localized?(original_value, l10n_value)
            squash(original_value) != squash(l10n_value)
          end

          def upload_tts_short_instructions_l10n(level, locale)
            tts_short_instructions_l10n = level.tts_short_instructions_text(locale: locale)
            return if tts_short_instructions_l10n.empty?

            tts_short_instructions = sanitize_tts(level.short_instructions)
            return unless localized?(tts_short_instructions, tts_short_instructions_l10n)

            level.tts_upload_to_s3(tts_short_instructions_l10n, METRIC_CONTEXT, locale: locale)
          end

          def upload_tts_long_instructions_l10n(level, locale)
            tts_long_instructions_l10n = level.tts_long_instructions_text(locale: locale)
            return if tts_long_instructions_l10n.empty?

            tts_long_instructions = sanitize_tts(level.long_instructions)
            return unless localized?(tts_long_instructions, tts_long_instructions_l10n)

            level.tts_upload_to_s3(tts_long_instructions_l10n, METRIC_CONTEXT, locale: locale)
          end

          def upload_tts_authored_hints_l10n(level, locale)
            localized_authored_hints = I18n.with_locale(locale) {level.localized_authored_hints}
            return unless localized_authored_hints

            original_hints = JSON.parse(level.authored_hints)
            localized_hints = JSON.parse(localized_authored_hints)

            localized_hints.zip(original_hints).each do |localized_hint, original_hint|
              tts_hint_markdown_l10n = sanitize_tts(localized_hint['hint_markdown'])
              next if tts_hint_markdown_l10n.empty?

              tts_hint_markdown = sanitize_tts(original_hint['hint_markdown'])
              next unless localized?(tts_hint_markdown, tts_hint_markdown_l10n)

              level.tts_upload_to_s3(tts_hint_markdown_l10n, METRIC_CONTEXT, locale: locale)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::TextToSpeech::SyncOut.perform if __FILE__ == $0
