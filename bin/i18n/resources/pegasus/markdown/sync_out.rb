#!/usr/bin/env ruby

require 'fileutils'

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_out_base'
require_relative '../../../utils/pegasus_markdown'
require_relative '../markdown'

module I18n
  module Resources
    module Pegasus
      module Markdown
        class SyncOut < I18n::Utils::SyncOutBase
          DIR_NAME = 'codeorg-markdown'.freeze

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
            Dir.glob(File.join(crowdin_locale_resource_dir, '**/*.md')) do |crowdin_file_path|
              crowdin_file_subpath = crowdin_file_path.delete_prefix(File.join(crowdin_locale_resource_dir, '/'))

              crowdin_file_subdir = crowdin_file_subpath.delete_suffix(File.basename(crowdin_file_subpath))
              markdown_file_subdir = crowdin_file_subdir.start_with?('views') ? crowdin_file_subdir : File.join('public', crowdin_file_subdir)

              origin_markdown_file_path = File.join(ORIGIN_DIR_PATH, markdown_file_subdir, File.basename(crowdin_file_subpath))
              # Because we give _all_ files coming from crowdin the partial
              # extension, we can't know for sure whether or not the origin also uses
              # that extension unless we check both with and without.
              origin_markdown_file_path += PARTIAL_EXTNAME unless File.exist?(origin_markdown_file_path)
              next unless File.exist?(origin_markdown_file_path)

              markdown_name = File.basename(crowdin_file_subpath, '.md')
              markdown_i18n_file_path = File.join(
                ORIGIN_I18N_DIR_PATH, markdown_file_subdir, "#{markdown_name}.#{locale}.md#{PARTIAL_EXTNAME}"
              )

              I18nScriptUtils.copy_file(crowdin_file_path, markdown_i18n_file_path)
              I18n::Utils::PegasusMarkdown.restore_file_header(origin_markdown_file_path, markdown_i18n_file_path)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Markdown::SyncOut.perform if __FILE__ == $0
