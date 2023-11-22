require_relative 'pegasus_markdown'

module I18n
  module Utils
    class PegasusEmail < I18n::Utils::PegasusMarkdown
      def self.sanitize_header(header)
        header.slice('subject')
      end
    end
  end
end
