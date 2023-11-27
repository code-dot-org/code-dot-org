require_relative 'pegasus_markdown'

module I18n
  module Utils
    class PegasusEmail < I18n::Utils::PegasusMarkdown
      TRANSLATABLE_HEADER_SECTIONS = %w[subject].freeze
    end
  end
end
