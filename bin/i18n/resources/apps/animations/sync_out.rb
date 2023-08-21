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
        module SyncOut
          def self.perform
            manifest_builder = ManifestBuilder.new({spritelab: true, upload_to_s3: true, quiet: true})

            PegasusLanguages.get_crowdin_name_and_locale.each do |pegasus_lang|
              locale = pegasus_lang[:locale_s]

              crowdin_locale_dir = CDO.dir(File.join(I18N_LOCALES_DIR, pegasus_lang[:crowdin_name_s], DIR_NAME))
              next unless File.directory?(crowdin_locale_dir)

              # Move files for directory like `i18n/locales/Italian/animations` to `i18n/locales/it-IT/animations`
              i18n_locale_dir = CDO.dir(File.join(I18N_LOCALES_DIR, locale, DIR_NAME))
              FileUtils.mkdir_p(i18n_locale_dir)
              FileUtils.cp_r File.join(crowdin_locale_dir, '.'), i18n_locale_dir
              FileUtils.rm_r crowdin_locale_dir

              next if locale == 'en-US'

              Dir[File.join(i18n_locale_dir, '**/*.json')].each do |filepath|
                # e.g., '/animations/spritelab_animation_library.json'
                i18n_source_file_subpath = filepath[/^.*(\/#{DIR_NAME}\/.*)$/o, 1]
                next unless I18nScriptUtils.file_changed?(locale, i18n_source_file_subpath)

                puts "Distributing Apps animations #{locale} i18n file: #{filepath}"
                js_locale = I18nScriptUtils.to_js_locale(locale)
                translations = JSON.load_file(filepath)
                # Use js_locale here as the animation library is used by apps
                manifest_builder.upload_localized_manifest(js_locale, translations)
              end
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Apps::Animations::SyncOut.perform if __FILE__ == $0
