#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../../../utils/pegasus_markdown'
require_relative '../hourofcode'

module I18n
  module Resources
    module Pegasus
      module HourOfCode
        class SyncIn < I18n::Utils::SyncInBase
          MARKDOWN_DIR_PATH = File.join(ORIGIN_DIR_PATH, MARKDOWN_DIR_NAME).freeze
          ORIGIN_I18N_FILE_PATH = File.join(ORIGIN_I18N_DIR_PATH, ORIGIN_I18N_FILE_NAME).freeze

          # Pulls in all strings that need to be translated for HourOfCode.com.
          # Pulls source files from pegasus/sites.v3/hourofcode.com and collects them
          # to a single source folder i18n/locales/source
          def process
            hoc_markdown_files = Dir.glob(File.join(MARKDOWN_DIR_PATH, '**/*.{md,md.partial}'))
            progress_bar.total = hoc_markdown_files.size

            # Copy the file containing developer-added strings
            if File.exist?(ORIGIN_I18N_FILE_PATH)
              progress_bar.total += 1

              I18nScriptUtils.copy_file(ORIGIN_I18N_FILE_PATH, I18N_SOURCE_DIR_PATH)

              progress_bar.increment
            end

            # Copy the markdown files representing individual page content
            I18nScriptUtils.process_in_threads(hoc_markdown_files) do |hoc_markdown_file_path|
              i18n_source_file_path = hoc_markdown_file_path.sub(
                MARKDOWN_DIR_PATH, I18N_SOURCE_DIR_PATH
              ).delete_suffix(PARTIAL_EXTNAME)

              I18nScriptUtils.copy_file(hoc_markdown_file_path, i18n_source_file_path)
              I18n::Utils::PegasusMarkdown.sanitize_file_header(i18n_source_file_path)
            ensure
              mutex.synchronize {progress_bar.increment}
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::HourOfCode::SyncIn.perform if __FILE__ == $0
