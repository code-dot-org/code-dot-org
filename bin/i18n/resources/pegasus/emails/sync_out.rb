#!/usr/bin/env ruby

require 'fileutils'

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../../../utils/pegasus_email'
require_relative '../emails'

module I18n
  module Resources
    module Pegasus
      module Emails
        class SyncOut < I18n::Utils::SyncOutBase
          def process(language)
            crowdin_locale_dir = I18nScriptUtils.locale_dir(language[:crowdin_name_s], DIR_NAME)
            return unless File.directory?(crowdin_locale_dir)

            unless I18nScriptUtils.source_lang?(language)
              distribute(language[:locale_s], crowdin_locale_dir)
            end

            FileUtils.rm_r(crowdin_locale_dir)
          end

          private

          def distribute(locale, crowdin_locale_resource_dir)
            Dir.glob('*.md', base: crowdin_locale_resource_dir) do |crowdin_file_subpath|
              # `hoc_signup_2015_receipt.md` => `hoc_signup_2015_receipt_es-ES.md`
              # `hoc_signup_2023_receipt_en.md` => `hoc_signup_2023_receipt_es-ES.md`
              origin_markdown_file_path = File.join(ORIGIN_DIR_PATH, crowdin_file_subpath)
              next unless File.exist?(origin_markdown_file_path)

              crowdin_file_path = File.join(crowdin_locale_resource_dir, crowdin_file_subpath)
              target_file_subpath = crowdin_file_subpath.sub(/(_en.md|.md)$/, "_#{locale}.md")
              target_file_path = File.join(ORIGIN_DIR_PATH, 'i18n', target_file_subpath)

              I18nScriptUtils.copy_file(crowdin_file_path, target_file_path)
              I18n::Utils::PegasusEmail.restore_file_header(origin_markdown_file_path, target_file_path)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Emails::SyncOut.perform if __FILE__ == $0
