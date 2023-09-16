require 'fileutils'

require_relative '../i18n_script_utils'
require_relative '../metrics'

Dir[File.expand_path('../pegasus/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Pegasus
      def self.sync_in
        I18n::Metrics.report_runtime('HourOfCode', 'in') {HourOfCode.sync_in}
        I18n::Metrics.report_runtime('Markdown', 'in') {Markdown.sync_in}
        Mobile.sync_in
      end

      def self.sync_out
        HourOfCode.sync_out
        Markdown.sync_out
        Mobile.sync_out
      end
    end
  end
end
