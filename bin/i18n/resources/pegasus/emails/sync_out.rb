#!/usr/bin/env ruby

require 'fileutils'

require_relative '../../../i18n_script_utils'
require_relative '../emails'

module I18n
  module Resources
    module Pegasus
      module Emails
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_dir_path = I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME)
            return unless File.directory?(crowdin_dir_path)

            unless I18nScriptUtils.source_lang?(language)
              Dir.glob('*.md', base: crowdin_dir_path) do |crowdin_file_subpath|
                # `hoc_signup_2015_receipt.md` => `hoc_signup_2015_receipt_es-ES.md`
                # `hoc_signup_2023_receipt_en.md` => `hoc_signup_2023_receipt_es-ES.md`
                target_file_subpath = crowdin_file_subpath.sub(/(_en.md|.md)$/, "_#{language[:locale_s]}.md")

                target_file_path = File.join(ORIGIN_DIR_PATH, 'i18n', target_file_subpath)
                crowdin_file_path = File.join(crowdin_dir_path, crowdin_file_subpath)
                origin_markdown_file_path = File.join(ORIGIN_DIR_PATH, crowdin_file_subpath)

                I18nScriptUtils.copy_file(crowdin_file_path, target_file_path)
                I18n::Utils::PegasusMarkdown.restore_file_header(origin_markdown_file_path, target_file_path)
              end
            end

            i18n_dir_path = I18nScriptUtils.locale_dir(language[:locale_s], DIR_NAME)
            I18nScriptUtils.rename_dir(crowdin_dir_path, i18n_dir_path)
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Emails::SyncOut.perform if __FILE__ == $0
