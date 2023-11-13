#!/usr/bin/env ruby

require 'fileutils'
require 'yaml'

require_relative '../../../../../dashboard/config/environment'
require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../../../utils/pegasus_markdown'
require_relative '../hourofcode'

module I18n
  module Resources
    module Pegasus
      module HourOfCode
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_locale_dir = I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME)
            return unless File.directory?(crowdin_locale_dir)

            unless I18nScriptUtils.source_lang?(language)
              distribute_origin_i18n_file(language[:unique_language_s], crowdin_locale_dir)
              distribute_markdown_files(language[:unique_language_s], crowdin_locale_dir)
            end

            I18nScriptUtils.rename_dir(crowdin_locale_dir, I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME))
          end

          private

          def distribute_origin_i18n_file(unique_language_code, crowdin_locale_dir)
            crowdin_en_file_path = File.join(crowdin_locale_dir, ORIGIN_I18N_FILE_NAME)
            return unless File.exist?(crowdin_en_file_path)

            # replace the translations root locale key `en` with the unique language code, e.g. `{'es' => ...}`
            crowdin_translations = YAML.load_file(crowdin_en_file_path)
            locale_translations = {unique_language_code => crowdin_translations.values.first}

            # renames yml file from `en.yml` to `{unique_language_code}.yml`, e.g. `es.yml`
            crowdin_locale_file_path = File.join(crowdin_locale_dir, "#{unique_language_code}.yml")
            File.write(crowdin_locale_file_path, YAML.dump(locale_translations))

            I18nScriptUtils.copy_file(crowdin_locale_file_path, ORIGIN_I18N_DIR_PATH)

            FileUtils.rm(crowdin_en_file_path)
          end

          # Copy the markdown files representing individual page content
          def distribute_markdown_files(unique_language_code, crowdin_locale_dir)
            Dir.glob(File.join(crowdin_locale_dir, '**/*.md')) do |crowdin_file_path|
              file_name = crowdin_file_path.delete_prefix(crowdin_locale_dir)

              hoc_markdown_file_path = File.join(ORIGIN_DIR_PATH, MARKDOWN_DIR_NAME, file_name)
              # Because we give _all_ files coming from crowdin the partial
              # extension, we can't know for sure whether or not the origin also uses
              # that extension unless we check both with and without.
              hoc_markdown_file_path += PARTIAL_EXTNAME unless File.exist?(hoc_markdown_file_path)
              next unless File.exist?(hoc_markdown_file_path)

              hoc_markdown_i18n_file_path = File.join(
                ORIGIN_I18N_DIR_PATH, MARKDOWN_DIR_NAME, unique_language_code, "#{file_name}#{PARTIAL_EXTNAME}"
              )

              I18nScriptUtils.copy_file(crowdin_file_path, hoc_markdown_i18n_file_path)
              I18n::Utils::PegasusMarkdown.restore_file_header(hoc_markdown_file_path, hoc_markdown_i18n_file_path)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::HourOfCode::SyncOut.perform if __FILE__ == $0
