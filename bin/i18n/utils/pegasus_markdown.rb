require 'fileutils'

require_relative '../i18n_script_utils'

module I18n
  module Utils
    module PegasusMarkdown
      def self.write_to(file_path, header, markdown)
        FileUtils.mkdir_p(File.dirname(file_path))

        File.open(file_path, 'w') do |f|
          unless header.empty?
            f.write(I18nScriptUtils.to_crowdin_yaml(header))
            f.write("---\n\n")
          end
          f.write(markdown)
        end
      end

      # Reduce the header metadata we include in markdown files down to just the
      # subset of content we want to allow translators to translate.
      #
      # Right now, this is just page titles but it could be expanded to include
      # any English content (description, social share stuff, etc).
      def self.sanitize_header(header)
        header.slice('title')
      end

      # YAML headers can include a lot of things we don't want translators to mess
      # with or worry about; layout, navigation settings, social media tags, etc.
      # However, they also include things like page titles that we DO want
      # translators to be able to translate, so we can't ignore them completely.
      # Instead, here we reduce the headers down to contain only the keys we care
      # about and then in the out step we reinflate the received headers with the
      # values from the original source.
      def self.sanitize_file_header(file_path)
        header, content, _line = Documents.new.helpers.parse_yaml_header(file_path)
        sanitized_header = sanitize_header(header)
        write_to(file_path, sanitized_header, content)
      end

      # In the sync in, we slice the YAML headers of the files we upload to crowdin
      # down to just the part we want to translate (ie, the title). Here, we
      # reinflate the header with all the values from the source file.
      def self.restore_file_header(origin_file_path, target_file_path)
        origin_header, _origin_content, _origin_line = Documents.new.helpers.parse_yaml_header(origin_file_path)
        target_header, target_content, _target_line = Documents.new.helpers.parse_yaml_header(target_file_path)

        sanitized_target_header = sanitize_header(target_header)
        restored_header = origin_header.merge(sanitized_target_header)

        write_to(target_file_path, restored_header, target_content)
      end
    end
  end
end
