#!/usr/bin/env ruby

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/sync_in_base'
require_relative '../../../utils/pegasus_email'
require_relative '../emails'

module I18n
  module Resources
    module Pegasus
      module Emails
        class SyncIn < I18n::Utils::SyncInBase
          LOCALIZABLE_FILE_SUBPATHS = %w[
            hoc_signup_2023_receipt.md
          ].freeze

          def process
            LOCALIZABLE_FILE_SUBPATHS.each do |file_name|
              i18n_source_file_path = File.join(I18N_SOURCE_DIR_PATH, file_name)
              I18nScriptUtils.copy_file(File.join(ORIGIN_DIR_PATH, file_name), i18n_source_file_path)
              I18n::Utils::PegasusEmail.sanitize_file_header(i18n_source_file_path)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Emails::SyncIn.perform if __FILE__ == $0
