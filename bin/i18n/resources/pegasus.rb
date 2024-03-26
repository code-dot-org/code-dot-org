require_relative '../i18n_script_utils'

module I18n
  module Resources
    module Pegasus
      DIR_NAME = 'pegasus'.freeze

      def self.sync_in
        HourOfCode.sync_in
        Markdown.sync_in
        Mobile.sync_in
      end

      def self.sync_up(**opts)
        HourOfCode.sync_up(**opts)
        Markdown.sync_up(**opts)
        Mobile.sync_up(**opts)
      end

      def self.sync_down(**opts)
        HourOfCode.sync_down(**opts)
        Markdown.sync_down(**opts)
        Mobile.sync_down(**opts)
      end

      def self.sync_out
        HourOfCode.sync_out
        Markdown.sync_out
        Mobile.sync_out
      end
    end
  end
end

Dir[File.expand_path('../pegasus/*.rb', __FILE__)].sort.each {|file| require file}
