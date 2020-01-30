require File.expand_path('../../../dashboard/config/environment', __FILE__)

require 'cdo/google_drive'
require 'cgi'
require 'fileutils'
require 'psych'

I18N_SOURCE_DIR = "i18n/locales/source"

CROWDIN_PROJECTS = {
  "codeorg": {
    config_file: File.join(File.dirname(__FILE__), "codeorg_crowdin.yml"),
    identity_file: File.join(File.dirname(__FILE__), "codeorg_credentials.yml")
  },
  "codeorg-markdown": {
    config_file: File.join(File.dirname(__FILE__), "codeorg_markdown_crowdin.yml"),
    identity_file: File.join(File.dirname(__FILE__), "codeorg_markdown_credentials.yml")
  },
  "hour-of-code": {
    config_file: File.join(File.dirname(__FILE__), "hourofcode_crowdin.yml"),
    identity_file: File.join(File.dirname(__FILE__), "hourofcode_credentials.yml")
  }
}

class I18nScriptUtils
  # Output the given data to YAML that will be consumed by Crowdin. Includes a
  # couple changes to the default `data.to_yaml` serialization:
  #
  #   1. Don't wrap lines. This is an optional feature provided by yaml, intended
  #      to make human editing of the serialized data easier. Because this data
  #      is only managed programmatically, we avoid wrapping to make the git
  #      diffs smaller and change detection easier.
  #
  #   2. Quote 'y' and 'n'. Psych intentionally departs from the YAML spec for
  #      these strings: https://github.com/ruby/psych/blob/8e880f7837db9ed66032a1dddc85444a1514a1e3/test/psych/test_boolean.rb#L21-L35
  #      But Crowdin sticks strictly to the YAML spec, so here we add special
  #      logic to ensure that we conform to the spec when outputting for Crowdin
  #      consumption.
  #      See https://github.com/gvvaughan/lyaml/issues/8#issuecomment-123132430
  def self.to_crowdin_yaml(data)
    ast = Psych.parse_stream(Psych.dump(data))

    # Make sure we treat the strings 'y' and 'n' as strings, and not bools
    yaml_bool = /^(?:y|Y|n|N)$/
    ast.grep(Psych::Nodes::Scalar).each do |node|
      if yaml_bool.match node.value
        node.plain = false
        node.quoted = true
      end
    end

    return ast.yaml(nil, {line_width: -1})
  end

  def self.git_add_and_commit(paths, commit_message)
    paths.each do |path|
      `git add #{path}`
    end
    `git commit -m "#{commit_message}"`
  end

  def self.run_standalone_script(location)
    Open3.popen3(location) do |_stdin, stdout, stderr, _wait_thread|
      while line = stdout.gets
        puts(line)
      end
      while line = stderr.gets
        puts(line)
      end
    end
  end

  def self.run_bash_script(location)
    I18nScriptUtils.run_standalone_script("bash #{location}")
  end

  def self.report_malformed_restoration(key, translation, file_name)
    @malformed_restorations ||= [["Key", "File Name", "Translation"]]
    @malformed_restorations << [key, file_name, translation]
  end

  def self.upload_malformed_restorations(locale)
    return if @malformed_restorations.blank?
    Google::Drive.new.add_sheet_to_spreadsheet(@malformed_restorations, "i18n_bad_translations", locale)
    @malformed_restorations = nil
  end

  def self.recursively_find_malformed_links_images(hash, key_str, file_name)
    hash.each do |key, val|
      if val.is_a?(Hash)
        I18nScriptUtils.recursively_find_malformed_links_images(val, "#{key_str}.#{key}", file_name)
      else
        I18nScriptUtils.report_malformed_restoration("#{key_str}.#{+key}", val, file_name) if I18nScriptUtils.contains_malformed_link_or_image(val)
      end
    end
  end

  # This function currently looks for
  # 1. Translations with malformed redaction syntax, i.e. [] [0] (note the space)
  # 2. Translations with similarly malformed markdown, i.e. [link] (example.com)
  # If this function finds either of these cases in the string, it return true.
  def self.contains_malformed_link_or_image(translation)
    malformed_redaction_regex = /\[.*\]\s+\[[0-9]+\]/
    malformed_markdown_regex = /\[.*\]\s+\(.+\)/
    non_malformed_redaction = (translation =~ malformed_redaction_regex).nil?
    non_malformed_translation = (translation =~ malformed_markdown_regex).nil?
    return !(non_malformed_redaction && non_malformed_translation)
  end

  def self.get_level_url_key(script, level)
    script_level = level.script_levels.find_by_script_id(script.id)
    path = script_level.build_script_level_path(script_level)
    URI.join("https://studio.code.org", path)
  end

  def self.get_level_from_url(url)
    # memoize to reduce repeated database interactions
    @levels_by_url ||= Hash.new do |hash, new_url|
      route = Rails.application.routes.recognize_path(new_url)

      unless route[:controller] == "script_levels"
        puts "unknown route #{route[:controller]}"
        next
      end

      script = Script.get_from_cache(route[:script_id])
      unless script.present?
        puts "unknown script #{route[:script_id]}"
        next
      end

      # copied from script_levels_controller
      # TODO: find a more-generalizable way to do this
      level = case route[:action]
              when "show"
                script_level = if route[:chapter]
                                 script.get_script_level_by_chapter(route[:chapter])
                               elsif route[:stage_position]
                                 script.get_script_level_by_relative_position_and_puzzle_position(route[:stage_position], route[:id], false)
                               elsif route[:lockable_stage_position]
                                 script.get_script_level_by_relative_position_and_puzzle_position(route[:lockable_stage_position], route[:id], true)
                               else
                                 script.get_script_level_by_id(route[:id])
                               end
                script_level.level
              when "stage_extras"
                uri = URI.parse(new_url)
                params = CGI.parse(uri.query)
                if params.key?('id')
                  script_level = Script.cache_find_script_level(params['id'].first)
                  script_level.level
                elsif params.key?('level_name')
                  Level.find_by_name(params['level_name'].first)
                end
              else
                puts "unknown route action #{route[:action]}"
                nil
              end

      unless level.present?
        puts "could not find level"
        next
      end

      hash[new_url] = level
    end

    @levels_by_url[url]
  end
end
