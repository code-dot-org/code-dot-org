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
          TTS_LOCALES = ::TextToSpeech::VOICES.keys - %i[en-US]

          def perform
            progress_bar.start

            progress_bar.total = tts_units.size
            tts_units.find_each do |unit|
              next unless unit.text_to_speech_enabled?

              unit.levels.merge(Blockly.all).find_each do |level|
                I18nScriptUtils.process_in_threads(TTS_LOCALES) do |locale|
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

          private def tts_units
            @tts_units ||= Unit.tts_enabled
          end

          private def mutex
            @mutex ||= Mutex.new
          end

          private def sanitize_tts(text)
            # Because the Redcarpet instance is not thread-safe (https://github.com/vmg/redcarpet/issues/570),
            # sharing the Redcarpet::Markdown formatter in multi-threaded operations may cause the error:
            # "markdown.c:2897: sd_markdown_render: Assertion `md->work_bufs[BUFFER_BLOCK].size == 0' failed.".
            # More details here: https://www.redmine.org/issues/32563
            mutex.synchronize {::TextToSpeech.sanitize(text || '')}
          end

          private def squash(value)
            case value
            when String then value.gsub(/\s+/, '')
            when Array then squash(value.join)
            when Hash then squash(value.values)
            else ''
            end
          end

          private def localized?(original_value, l10n_value)
            squash(original_value) != squash(l10n_value)
          end

          private def upload_tts_short_instructions_l10n(level, locale)
            tts_short_instructions_l10n = mutex.synchronize {level.tts_short_instructions_text(locale: locale)}
            return if tts_short_instructions_l10n.empty?

            tts_short_instructions = sanitize_tts(level.short_instructions)
            return unless localized?(tts_short_instructions, tts_short_instructions_l10n)

            level.tts_upload_to_s3(tts_short_instructions_l10n, 'short_instructions', METRIC_CONTEXT, locale: locale)
          end

          private def upload_tts_long_instructions_l10n(level, locale)
            tts_long_instructions_l10n = mutex.synchronize {level.tts_long_instructions_text(locale: locale)}
            return if tts_long_instructions_l10n.empty?

            tts_long_instructions = sanitize_tts(level.long_instructions)
            return unless localized?(tts_long_instructions, tts_long_instructions_l10n)

            level.tts_upload_to_s3(tts_long_instructions_l10n, 'long_instructions', METRIC_CONTEXT, locale: locale)
          end

          private def upload_tts_authored_hints_l10n(level, locale)
            localized_authored_hints = I18n.with_locale(locale) do
              mutex.synchronize {level.localized_authored_hints}
            end
            return unless localized_authored_hints

            original_hints = JSON.parse(level.authored_hints)
            localized_hints = JSON.parse(localized_authored_hints)

            localized_hints.zip(original_hints).each do |localized_hint, original_hint|
              tts_hint_markdown_l10n = sanitize_tts(localized_hint['hint_markdown'])
              next if tts_hint_markdown_l10n.empty?

              tts_hint_markdown = sanitize_tts(original_hint['hint_markdown'])
              next unless localized?(tts_hint_markdown, tts_hint_markdown_l10n)

              level.tts_upload_to_s3(tts_hint_markdown_l10n, 'hint_markdown', METRIC_CONTEXT, locale: locale)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Dashboard::TextToSpeech::SyncOut.perform if __FILE__ == $0
