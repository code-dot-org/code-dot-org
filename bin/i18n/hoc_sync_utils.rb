require_relative '../../dashboard/config/environment'
require File.expand_path('../../../pegasus/src/env', __FILE__)

require_relative 'i18n_script_utils'
require 'cdo/languages'
require 'fileutils'
require 'tempfile'

class HocSyncUtils
  def self.sync_out
    rename_yml_to_locale
    copy_from_i18n_source_to_hoc
    restore_sanitized_headers
  end

  def self.rename_yml_to_locale
    puts "Updating crowdin codes to our locale codes..."
    PegasusLanguages.get_hoc_languages.each do |prop|
      # move downloaded folders to root source directory and rename from
      # language to locale
      dest_dir = "i18n/locales/#{prop[:locale_s]}"
      next unless File.directory?(dest_dir)

      # replace the crowdin code in the file itself with our own unique
      # language code
      old_path = File.join(dest_dir, "hourofcode/en.yml")
      crowdin_translation_data = YAML.load_file(old_path)
      next unless File.exist?(old_path)
      new_translation_data = {}
      new_translation_data[prop[:unique_language_s]] = crowdin_translation_data.values.first

      # rename yml file from en.yml to code
      new_path = File.join(dest_dir, "hourofcode/#{prop[:unique_language_s]}.yml")
      File.write(new_path, new_translation_data.to_yaml)
      FileUtils.rm old_path
    end
  end

  def self.copy_from_i18n_source_to_hoc
    puts "Copying files from cdo/i18n to hoc.com/i18n..."
    PegasusLanguages.get_hoc_languages.each do |prop|
      next if prop[:locale_s] == "en-US"
      i18n_path = "i18n/locales/#{prop[:locale_s]}/hourofcode"
      hoc_path = "pegasus/sites.v3/hourofcode.com/i18n"

      # Copy the file containing developer-added strings
      FileUtils.cp(i18n_path + "/#{prop[:unique_language_s]}.yml", hoc_path) if File.exist?(i18n_path + "/#{prop[:unique_language_s]}.yml")

      # Copy the markdown files representing individual page content
      Dir.glob(File.join(i18n_path, "**/*.md")).each do |source_path|
        # Copy file from the language-specific i18n directory to the
        # language-specific pegasus directory.
        source_dir = File.dirname(source_path)
        dest_dir = source_dir.sub(i18n_path, File.join(hoc_path, "public", prop[:unique_language_s]))

        # Crowdin didn't place nicely with changing the file extensions from md
        # to md.partial As a hopefully temporary solution, on the sync in we
        # remove the .partial ending and here we add it back.
        dest_name = File.basename(source_path) + ".partial"

        FileUtils.mkdir_p(dest_dir)
        FileUtils.cp(source_path, File.join(dest_dir, dest_name))
      end
    end
  end

  # In the sync in, we slice the YAML headers of the files we upload to crowdin
  # down to just the part we want to translate (ie, the title). Here, we
  # reinflate the header with all the values from the source file.
  def self.restore_sanitized_headers
    Dir.glob("pegasus/sites.v3/hourofcode.com/i18n/public/**/*.md.partial").each do |path|
      source_path = path.sub(/\/i18n\/public\/..\//, "/public/")
      unless File.exist? source_path
        # Because we give _all_ files coming from crowdin the partial
        # extension, we can't know for sure whether or not the source also uses
        # that extension unless we check both with and without.
        source_path = File.join(File.dirname(source_path), File.basename(source_path, ".partial"))
      end
      next unless File.exist? source_path
      source_header, _source_content, _source_line = Documents.new.helpers.parse_yaml_header(source_path)
      header, content, _line = Documents.new.helpers.parse_yaml_header(path)
      I18nScriptUtils.sanitize_header!(header)
      restored_header = source_header.merge(header)
      I18nScriptUtils.write_markdown_with_header(content, restored_header, path)
    end
  end
end
