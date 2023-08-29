#!/usr/bin/env ruby

require 'fileutils'
require 'json'

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
            pegasus_languages.each.with_index(1) do |pegasus_lang, next_lang_idx|
              progress_bar.title = progress_bar_title(next_lang_idx)

              crowdin_spritelab_file_path = CDO.dir(File.join(I18N_LOCALES_DIR, pegasus_lang[:crowdin_name_s], DIR_NAME, SPRITELAB_FILE_NAME))
              next unless File.exist?(crowdin_spritelab_file_path)

              locale = pegasus_lang[:locale_s]

              i18n_spritelab_file_path = CDO.dir(File.join(I18N_LOCALES_DIR, locale, DIR_NAME, SPRITELAB_FILE_NAME))
              FileUtils.mv crowdin_spritelab_file_path, i18n_spritelab_file_path, force: true
              FileUtils.rm_r File.dirname(crowdin_spritelab_file_path)

              next if locale == 'en-US'

              js_locale = I18nScriptUtils.to_js_locale(locale)
              translations = JSON.load_file(i18n_spritelab_file_path)
              spritelab_manifest_builder.upload_localized_manifest(js_locale, translations)
            ensure
              progress_bar.increment
            end
          end

          private

          def pegasus_languages
            @pegasus_languages ||= PegasusLanguages.get_crowdin_name_and_locale
          end

          def progress_bar_title(pegasus_lang_idx = 0)
            title = 'Apps/animations sync-out'
            pegasus_lang = pegasus_languages[pegasus_lang_idx]
            pegasus_lang ? "#{title} [#{pegasus_lang[:locale_s]}]" : title
          end

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(
              total: pegasus_languages.size,
              title: progress_bar_title,
            )
          end

          def spritelab_manifest_builder
            @spritelab_manifest_builder ||= ManifestBuilder.new({spritelab: true, upload_to_s3: true, quiet: true})
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Animations::SyncOut.perform if __FILE__ == $0
