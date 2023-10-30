#!/usr/bin/env ruby

require 'fileutils'

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/pegasus_markdown'
require_relative '../markdown'

module I18n
  module Resources
    module Pegasus
      module Markdown
        class SyncIn
          LOCALIZABLE_FILE_SUBPATHS = %w[
            hoc_signup_2023_receipt_en.md
          ].freeze

          def self.perform
            new.execute
          end

          def execute
            progress_bar.start

            I18nScriptUtils.process_in_threads(LOCALIZABLE_FILE_SUBPATHS) do |file_subpath|
              origin_file_path = File.join(ORIGIN_DIR_PATH, file_subpath)
              next unless File.exist?(origin_file_path)

              i18n_source_file_path = File.join(I18N_SOURCE_DIR_PATH, file_subpath)
              i18n_source_file_path = i18n_source_file_path.sub('public/public/', 'public/')

              I18nScriptUtils.copy_file(origin_file_path, i18n_source_file_path)
              I18n::Utils::PegasusMarkdown.sanitize_file_header(i18n_source_file_path)
            ensure
              mutex.synchronize {progress_bar.increment}
            end

            progress_bar.finish
          end

          private

          def progress_bar
            @progress_bar ||= I18nScriptUtils.create_progress_bar(
              title: 'Pegasus/pegasus_emails sync-in',
              total: LOCALIZABLE_FILE_SUBPATHS.size
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

I18n::Resources::Pegasus::Markdown::SyncIn.perform if __FILE__ == $0
