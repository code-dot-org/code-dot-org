#!/usr/bin/env ruby

require 'fileutils'

require_relative '../../../i18n_script_utils'
require_relative '../../../utils/pegasus_markdown'
require_relative '../emails'

module I18n
  module Resources
    module Pegasus
      module Emails
        class SyncIn < I18n::Utils::SyncInBase
          LOCALIZABLE_FILE_SUBPATHS = %w[
            hoc_signup_2023_receipt_en.md
          ].freeze

          def process
            LOCALIZABLE_FILE_SUBPATHS.each do |file|
              I18nScriptUtils.copy_file(`#{ORIGIN_DIR_PATH}/#{file}`, I18N_SOURCE_DIR_PATH)
            end
          end
        end
      end
    end
  end
end

I18n::Resources::Pegasus::Emails::SyncIn.perform if __FILE__ == $0
