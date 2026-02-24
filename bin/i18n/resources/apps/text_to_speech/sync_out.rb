#!/usr/bin/env ruby

require 'csv'
require 'json'

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../../../dashboard/app/models/concerns/text_to_speech'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../text_to_speech'

module I18n
  module Resources
    module Apps
      module TextToSpeech
        class SyncOut < I18n::Utils::SyncOutBase
          METRIC_CONTEXT = 'update_i18n_static_messages'.freeze
          TTS_LOCALES = ::TextToSpeech::VOICES.keys.freeze

          def perform
            progress_bar.start

            progress_bar.total = tts_key_files.size * TTS_LOCALES.size

            tts_key_files.each do |tts_keys_file|
              lab_name = File.basename(tts_keys_file, '.csv')
              tts_keys = CSV.read(tts_keys_file, strip: true).flatten
              next if tts_keys.empty?

              TTS_LOCALES.each do |locale|
                js_locale = I18nScriptUtils.to_js_locale(locale)

                i18n_file = CDO.dir('apps/i18n', lab_name, "#{js_locale}.json")
                next unless File.exist?(i18n_file)

                i18n_data = JSON.load_file(i18n_file)
                next if i18n_data.empty?

                I18nScriptUtils.process_in_threads(tts_keys) do |tts_key|
                  i18n_val = i18n_data[tts_key]
                  next unless i18n_val

                  tts_val = mutex.synchronize {::TextToSpeech.sanitize(i18n_val)}
                  tts_file = ::TextToSpeech.tts_path(i18n_val, i18n_val, locale: locale)

                  ::TextToSpeech.tts_upload_to_s3(tts_val, 'message', tts_file, METRIC_CONTEXT, locale: locale)
                end
              ensure
                progress_bar.increment
              end
            end

            progress_bar.finish
          end

          private def tts_key_files
            @tts_key_files ||= Dir[CDO.dir('apps/i18n/tts_keys/*.csv')]
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::TextToSpeech::SyncOut.perform if __FILE__ == $0
