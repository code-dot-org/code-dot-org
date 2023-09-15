#!/usr/bin/env ruby

require 'fileutils'

require_relative '../../../i18n_script_utils'
require_relative '../mobile'

module I18n
  module Resources
    module Pegasus
      module Mobile
        class SyncOut
          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            I18nScriptUtils.process_in_threads(pegasus_languages) do |pegasus_lang|
              crowdin_locale_dir = I18nScriptUtils.locale_dir(pegasus_lang[:crowdin_name_s])
              crowdin_resource_dir = File.join(crowdin_locale_dir, DIR_NAME)
              crowdin_file_path = File.join(crowdin_resource_dir, FILE_NAME)
              next unless File.exist?(crowdin_file_path)

              locale = pegasus_lang[:locale_s]
              unless locale == 'en-US'
                pegasus_i18n_file_poth = File.join(ORIGIN_I18N_DIR_PATH, "#{locale}.yml")
                I18nScriptUtils.sanitize_file_and_write(crowdin_file_path, pegasus_i18n_file_poth)
              end

              I18nScriptUtils.rename_dir(crowdin_resource_dir, I18nScriptUtils.locale_dir(locale, DIR_NAME))
            ensure
              I18nScriptUtils.remove_empty_dir(crowdin_locale_dir)

              mutex.synchronize {progress_bar.increment}
            end

            progress_bar.finish
          end

          private

          def pegasus_languages
            @pegasus_languages ||= PegasusLanguages.get_crowdin_name_and_locale
          end

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(
              title: 'Pegasus/mobile sync-out',
              total: pegasus_languages.size
            )
          end

          def mutex
            @mutex ||= Thread::Mutex.new
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Mobile::SyncOut.perform if __FILE__ == $0
