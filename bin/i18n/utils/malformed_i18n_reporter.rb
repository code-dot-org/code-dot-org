require 'cdo/google/drive'

require_relative '../i18n_script_utils'

module I18n
  module Utils
    class MalformedI18nReporter
      SPREADSHEET_NAME = 'i18n_bad_translations'.freeze
      WORKSHEET_HEADERS = ['Key', 'File Name', 'Translation'].freeze

      INVALID_TRANSLATION_PATTERNS = [
        # Translations with malformed redaction syntax, i.e. `[] [0]` (note the space)
        MALFORMED_REDACTION_REGEXP = /\[.*\]\s+\[[0-9]+\]/,

        # Translations with similarly malformed markdown, i.e. `[link] (example.com)`
        MALFORMED_MARKDOWN_REGEXP = /\[.*\]\s+\(.+\)/,
      ].freeze

      attr_reader :locale

      # @param locale [String] the BCP 47 (IETF language tag) format (e.g., 'en-US')
      def initialize(locale)
        @locale = locale
      end

      def worksheet_data
        @worksheet_data ||= []
      end

      def process_file(i18n_file_path)
        return unless File.exist?(i18n_file_path)

        translations = I18nScriptUtils.parse_file(i18n_file_path) rescue nil
        return unless translations

        collect_malformed_translations(locale, i18n_file_path, translations)
      end

      def report
        return if worksheet_data.empty?

        google_drive&.update_worksheet(SPREADSHEET_NAME, locale, [WORKSHEET_HEADERS, *worksheet_data])

        clear_worksheet_data
      rescue
        puts "Failed to upload malformed restorations for #{locale}"
      end

      private

      def google_drive
        return @google_drive if defined? @google_drive

        @google_drive = CDO.gdrive_export_secret && Google::Drive.new(service_account_key: CDO.gdrive_export_secret)
      end

      def update_worksheet_data(key, file_name, translation)
        worksheet_data << [key, file_name, translation]
      end

      def clear_worksheet_data
        remove_instance_variable(:@worksheet_data)
      end

      # @param translation [String] a translation line
      # @return [true, false]
      def contains_invalid_syntax?(translation)
        INVALID_TRANSLATION_PATTERNS.any? {|malformed_i18n_regexp| translation.match?(malformed_i18n_regexp)}
      end

      def collect_malformed_translations(key, file_name, translation)
        return if translation.nil? || translation.empty?

        case translation
        when Hash
          translation.each do |i18n_key, i18n_val|
            collect_malformed_translations("#{key}.#{i18n_key}", file_name, i18n_val)
          end
        when String
          update_worksheet_data(key, file_name, translation) if contains_invalid_syntax?(translation)
        end
      end
    end
  end
end
