#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../../../pegasus/helpers/pegasus_languages'
require_relative '../../../../animation_assets/manifest_builder'
require_relative '../../../i18n_script_utils'
require_relative '../animations'

module I18n
  module Resources
    module Apps
      module Animations
        class SyncOut
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            progress_bar.finish && return unless crowdin_spritelab_files_exist?

            # Memoizes animation metadata before processing in threads
            # to prevent them from being downloaded multiple times (in each thread separately)
            spritelab_manifest_builder.initial_animation_metadata
            progress_bar.progress = 30

            I18nScriptUtils.process_in_threads(pegasus_languages) do |pegasus_lang|
              crowdin_locale = pegasus_lang[:crowdin_name_s]
              crowdin_spritelab_file_path = crowdin_locale_spritelab_file_path(crowdin_locale)
              next unless File.exist?(crowdin_spritelab_file_path)

              locale = pegasus_lang[:locale_s]

              i18n_spritelab_file_path = I18nScriptUtils.locale_dir(locale, DIR_NAME, SPRITELAB_FILE_NAME)

              I18nScriptUtils.rename_dir(File.dirname(crowdin_spritelab_file_path), File.dirname(i18n_spritelab_file_path))
              I18nScriptUtils.delete_empty_crowdin_locale_dir(crowdin_locale)

              next if locale == 'en-US'

              js_locale = I18nScriptUtils.to_js_locale(locale)
              translations = JSON.load_file(i18n_spritelab_file_path)
              spritelab_manifest_builder.upload_localized_manifest(js_locale, translations)
            ensure
              mutex.synchronize do
                @lang_progress_incr ||= (progress_bar.total - progress_bar.progress).to_f / pegasus_languages.size
                progress_bar.progress += @lang_progress_incr
              rescue ProgressBar::InvalidProgressError
                progress_bar.finish
              end
            end

            progress_bar.finish
          end

          private

          def mutex
            @mutex ||= Thread::Mutex.new
          end

          def pegasus_languages
            @pegasus_languages ||= PegasusLanguages.get_crowdin_name_and_locale
          end

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(title: 'Apps/animations sync-out')
          end

          def spritelab_manifest_builder
            @spritelab_manifest_builder ||= ManifestBuilder.new({spritelab: true, upload_to_s3: true, quiet: true})
          end

          def crowdin_locale_spritelab_file_path(crowdin_locale)
            I18nScriptUtils.locale_dir(crowdin_locale, DIR_NAME, SPRITELAB_FILE_NAME)
          end

          def crowdin_spritelab_files_exist?
            pegasus_languages.any? do |pegasus_lang|
              File.exist?(crowdin_locale_spritelab_file_path(pegasus_lang[:crowdin_name_s]))
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Animations::SyncOut.perform if __FILE__ == $0
