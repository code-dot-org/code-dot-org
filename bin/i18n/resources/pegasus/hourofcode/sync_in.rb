#!/usr/bin/env ruby

require 'fileutils'
require 'json'

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/pegasus_markdown'
require_relative '../hourofcode'

module I18n
  module Resources
    module Pegasus
      module HourOfCode
        class SyncIn
          def self.perform
            new.execute
          end

          # Pulls in all strings that need to be translated for HourOfCode.com. Pulls
          # source files from pegasus/sites.v3/hourofcode.com and collects them to a
          # single source folder i18n/locales/source.
          def execute
            progress_bar.start

            # Copy the file containing developer-added strings
            hoc_origin_i18n_file_path = File.join(ORIGIN_I18N_DIR_PATH, ORIGIN_I18N_FILE_NAME)
            if File.exist?(hoc_origin_i18n_file_path)
              progress_bar.total += 1

              I18nScriptUtils.copy_file(hoc_origin_i18n_file_path, I18N_SOURCE_DIR_PATH)

              progress_bar.increment
            end

            # Copy the markdown files representing individual page content
            I18nScriptUtils.process_in_threads(hoc_markdown_files) do |hoc_markdown_file_path|
              i18n_source_file_path = hoc_markdown_file_path.sub(hoc_markdown_dir, I18N_SOURCE_DIR_PATH)
              i18n_source_file_path = i18n_source_file_path.delete_suffix(PARTIAL_EXTNAME)

              I18nScriptUtils.copy_file(hoc_markdown_file_path, i18n_source_file_path)
              I18n::Utils::PegasusMarkdown.sanitize_file_header(i18n_source_file_path)
            ensure
              mutex.synchronize {progress_bar.increment}
            end

            progress_bar.finish
          end

          private

          def mutex
            @mutex ||= Thread::Mutex.new
          end

          def hoc_markdown_dir
            @hoc_markdown_dir ||= File.join(ORIGIN_DIR_PATH, MARKDOWN_DIR_NAME)
          end

          def hoc_markdown_files
            @hoc_markdown_files ||= Dir.glob(File.join(hoc_markdown_dir, '**/*.{md,md.partial}'))
          end

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(
              title: 'Pegasus/hoc sync-in',
              total: hoc_markdown_files.size
            )
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::HourOfCode::SyncIn.perform if __FILE__ == $0
