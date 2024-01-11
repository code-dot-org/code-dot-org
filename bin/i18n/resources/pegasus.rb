require_relative '../i18n_script_utils'

Dir[File.expand_path('../pegasus/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Pegasus
      def self.sync_in
        HourOfCode.sync_in
        Markdown.sync_in
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
