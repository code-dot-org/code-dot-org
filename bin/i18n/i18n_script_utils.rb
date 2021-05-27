require File.expand_path('../../../dashboard/config/environment', __FILE__)

require 'cdo/google/drive'
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
  # Because we log many of the i18n operations to slack, we often want to
  # explicitly force stdout to operate synchronously, rather than buffering
  # output and dumping a whole lot of output into slack all at once.
  #
  # See the sync_up and sync_down methods in particular for usage.
  def self.with_synchronous_stdout
    old_sync = $stdout.sync
    $stdout.sync = true
    yield
    $stdout.sync = old_sync
  end

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
    if CDO.gdrive_export_secret
      begin
        @google_drive ||= Google::Drive.new(service_account_key: StringIO.new(CDO.gdrive_export_secret.to_json))
        @google_drive.add_sheet_to_spreadsheet(@malformed_restorations, "i18n_bad_translations", locale)
      rescue
        puts "Failed to upload malformed restorations for #{locale}"
      end
    end
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

  # Used by get_level_from_url, for the script_level-specific case.
  def self.get_script_level(route_params, url)
    script = Script.get_from_cache(route_params[:script_id])
    unless script.present?
      STDERR.puts "unknown script #{route_params[:script_id].inspect} for url #{url.inspect}"
      return nil
    end

    case route_params[:action]
    when "show"
      script_level = ScriptLevelsController.get_script_level(script, route_params)
      script_level&.level
    when "lesson_extras"
      # Copied from ScriptLevelsController.lesson_extras
      uri = URI.parse(url)
      uri_params = CGI.parse(uri.query)
      if uri_params.key?('id')
        script_level = Script.cache_find_script_level(uri_params['id'].first)
        script_level&.level
      elsif uri_params.key?('level_name')
        Level.find_by_name(uri_params['level_name'].first)
      end
    else
      STDERR.puts "unknown route action #{route_params[:action].inspect} for url #{url.inspect}"
      nil
    end
  end

  # Given a code.org url, if it's a valid level url (including things like
  # projects), return the level identified by this url.
  #
  # Note that this may not cover 100% of the possible different kinds of level
  # urls; we expect to expand this function over time as new cases are
  # discovered.
  def self.get_level_from_url(url)
    # memoize to reduce repeated database interactions
    @levels_by_url ||= Hash.new do |hash, new_url|
      route_params = Rails.application.routes.recognize_path(new_url)

      level =
        case route_params[:controller]
        when "projects"
          Level.find_by_name(ProjectsController::STANDALONE_PROJECTS.dig(route_params[:key], :name))
        when "script_levels"
          get_script_level(route_params, new_url)
        else
          STDERR.puts "unknown route #{route_params[:controller].inspect} for url #{new_url.inspect}"
        end

      unless level.present?
        STDERR.puts "could not find level for url #{new_url.inspect}"
        next
      end

      hash[new_url] = level
    end

    @levels_by_url[url]
  end

  def self.write_markdown_with_header(markdown, header, path)
    open(path, 'w') do |f|
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
  def self.sanitize_header!(header)
    header.slice!("title")
  end
end
