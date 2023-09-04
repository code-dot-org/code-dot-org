require File.expand_path('../../../dashboard/config/environment', __FILE__)
require File.expand_path('../../../pegasus/helpers/pegasus_languages', __FILE__)

require 'cdo/google/drive'
require 'cdo/honeybadger'
require 'cgi'
require 'fileutils'
require 'psych'
require 'ruby-progressbar'
require 'parallel'

I18N_LOCALES_DIR = 'i18n/locales'.freeze
I18N_SOURCE_DIR = File.join(I18N_LOCALES_DIR, 'source').freeze
I18N_ORIGINAL_DIR = File.join(I18N_LOCALES_DIR, 'original').freeze

CROWDIN_PROJECTS = {
  codeorg: {
    config_file:            CDO.dir('bin/i18n/codeorg_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/codeorg_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/codeorg_files_to_sync_out.json')
  },
  'codeorg-markdown': {
    config_file:            CDO.dir('bin/i18n/codeorg_markdown_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/codeorg-markdown_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/codeorg-markdown_files_to_sync_out.json')
  },
  'hour-of-code': {
    config_file:            CDO.dir('bin/i18n/hourofcode_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/hour-of-code_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/hour-of-code_files_to_sync_out.json')
  },
  'codeorg-restricted': {
    config_file:            CDO.dir('bin/i18n/codeorg_restricted_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/codeorg-restricted_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/codeorg-restricted_files_to_sync_out.json')
  },
}.freeze

CROWDIN_TEST_PROJECTS = {
  'codeorg-testing': {
    config_file: File.join(File.dirname(__FILE__), "codeorg-testing_crowdin.yml"),
    identity_file: File.join(File.dirname(__FILE__), "crowdin_credentials.yml"),
    etags_json: File.join(File.dirname(__FILE__), "crowdin", "codeorg-testing_etags.json"),
    files_to_sync_out_json: File.join(File.dirname(__FILE__), "crowdin", "codeorg-testing_files_to_sync_out.json")
  },
  'codeorg-markdown-testing': {
    config_file: File.join(File.dirname(__FILE__), "codeorg-testing_markdown_crowdin.yml"),
    identity_file: File.join(File.dirname(__FILE__), "crowdin_credentials.yml"),
    etags_json: File.join(File.dirname(__FILE__), "crowdin", "codeorg-testing_markdown_etags.json"),
    files_to_sync_out_json: File.join(File.dirname(__FILE__), "crowdin", "codeorg-testing_markdown_files_to_sync_out.json")
  }
}

class I18nScriptUtils
  PROGRESS_BAR_FORMAT = '%t: |%B| %p% %a'.freeze
  PARALLEL_PROCESSES = Parallel.processor_count / 2

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
    # Make sure we use the right format for strings with '#' in them, otherwise
    # YAML parsers might treat part of the string as a YAML comment.
    octothorpe = /#/
    ast.grep(Psych::Nodes::Scalar).each do |node|
      if yaml_bool.match node.value
        node.plain = false
        node.quoted = true
      elsif octothorpe.match node.value
        node.plain = false
        node.quoted = true
        node.style = Psych::Nodes::Scalar::DOUBLE_QUOTED
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
    script = Unit.get_from_cache(route_params[:script_id])
    unless script.present?
      error_class = 'Could not find script in get_script_level'
      error_message = "unknown script #{route_params[:script_id].inspect} for url #{url.inspect}"
      log_error(error_class, error_message)
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
        script_level = Unit.cache_find_script_level(uri_params['id'].first)
        script_level&.level
      elsif uri_params.key?('level_name')
        Level.find_by_name(uri_params['level_name'].first)
      end
    else
      error_class = 'Could not identify route in get_script_level'
      error_message = "unknown route action #{route_params[:action].inspect} for url #{url.inspect}"
      log_error(error_class, error_message)
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
          Level.find_by_name(route_params[:key])
        when "script_levels"
          get_script_level(route_params, new_url)
        else
          error_class = 'Could not identify route in get_level_from_url'
          error_message = "unknown route #{route_params[:controller].inspect} for url #{new_url.inspect}"
          log_error(error_class, error_message)
        end

      unless level.present?
        error_class = 'Could not find level in get_level_from_url'
        error_message = "could not find level for url #{new_url.inspect}"
        log_error(error_class, error_message)
        next
      end

      hash[new_url] = level
    end

    @levels_by_url[url]
  end

  def self.write_markdown_with_header(markdown, header, path)
    File.open(path, 'w') do |f|
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

  # For resources like `course_content` and `curriculum_content`,
  # sync-in creates the unit course_version/course_offering directory structure
  # (e.g. `i18n/locales/source/curriculum_content/2017/csd/csd1.json`).
  #
  # If a unit is updated such that its destination directory changes after
  # creation, we can end up in a situation in which we have multiple copies of
  # the unit file in the repo, which makes it difficult for the sync out to
  # know which is the canonical version.
  #
  # To prevent that, here we proactively check for existing files in the
  # filesystem with the same filename as our target unit file, but a
  # different directory. If found, we refuse to create the second such unit
  # file and notify of the attempt, so the issue can be manually resolved.
  #
  # Example:
  #   If `course_version` of the unit `csd1` was changed from `2017` to `2023`,
  #   the new unit file `i18n/locales/source/curriculum_content/2023/csd/csd1.json` should not be created
  #   until the previous unit file `i18n/locales/source/curriculum_content/2017/csd/csd1.json` is synced-out
  #
  # Note we could try here to remove the old version of the file both from the
  # filesystem and from github, but it would be significantly harder to also
  # remove it from Crowdin.
  def self.unit_directory_change?(content_dir, unit_i18n_filename, unit_i18n_filepath)
    matching_files = Dir.glob(File.join(content_dir, "**", unit_i18n_filename)).reject do |other_filename|
      other_filename == unit_i18n_filepath
    end

    return false if matching_files.empty?

    # Clean up the file paths, just to make our output a little nicer
    base = Pathname.new(content_dir)
    relative_matching = matching_files.map {|filename| Pathname.new(filename).relative_path_from(base)}
    relative_new = Pathname.new(unit_i18n_filepath).relative_path_from(base)
    unit_name = File.basename(unit_i18n_filename, '.*')
    error_class = 'Destination directory for unit is attempting to change'
    error_message = "Unit #{unit_name} wants to output strings to #{relative_new}, but #{relative_matching.join(' and ')} already exists"
    log_error(error_class, error_message)

    true
  end

  def self.log_error(error_class, error_message)
    # [FND-1667] Uncomment this once we have enabled Honeybadger usage on the i18n-dev server.
    # Honeybadger.notify(
    #   error_class: error_class,
    #   error_message: error_message
    # )
    puts "[#{error_class}] #{error_message}"
  end

  def self.fix_yml_file(filepath)
    # Ryby implementation of the removed perl script `bin/i18n-codeorg/lib/fix-ruby-yml.pl`
    # while(<>) {
    #   # Remove ---
    #   s/^---\n//;
    #   # Fixes the "no:" problem.
    #   s/^([a-z]+(?:-[A-Z]+)?):(.*)/"\1":\2/g;
    #   print;
    # }

    yml_data = File.read(filepath)

    yml_data.sub!(/^---\n/, '')                             # Remove ---
    yml_data.gsub!(/^([a-z]+(?:-[A-Z]+)?):(.*)/, '"\1":\2') # Fixes the "no:" problem.

    File.write(filepath, yml_data)
  end

  # Return true iff the specified file in the specified locale had changes
  # since the last successful sync-out.
  #
  # @param locale [String] the locale code to check. This can be either the
  #  four-letter code used internally (ie, "es-ES", "es-MX", "it-IT", etc), OR
  #  the two-letter code used by crowdin, for those languages for which we have
  #  only a single variation ("it", "de", etc).
  #
  # @param file [String] the path to the file to check. Note that this should be
  #  the relative path of the file as it exists within the locale directory; ie
  #  "/dashboard/base.yml", "/blockly-mooc/maze.json",
  #  "/course_content/2018/coursea-2018.json", etc.
  def self.file_changed?(locale, file)
    @change_data ||= CROWDIN_PROJECTS.map do |_project_identifier, project_options|
      # TODO: investigate the condition as a potential cause of sync fails
      unless File.exist?(project_options[:files_to_sync_out_json])
        raise <<~ERR
          File not found #{project_options[:files_to_sync_out_json]}.

          We expect to find a file containing a list of files changed by the most
          recent sync down; if this file does not exist, it likely means that no
          sync down has been run on this machine, so there is nothing to sync out
        ERR
      end
      JSON.load_file(project_options[:files_to_sync_out_json])
    end

    crowdin_code = PegasusLanguages.get_code_by_locale(locale)

    @change_data.any? {|change_data| change_data.dig(locale, file) || change_data.dig(crowdin_code, file)}
  end

  # Formats strings like 'en-US' to 'en_us'
  #
  # @param [String] locale the BCP 47 (IETF language tag) format (e.g., 'en-US')
  # @return [String] the BCP 47 (IETF language tag) JS format (e.g., 'en_us')
  def self.to_js_locale(locale)
    locale.tr('-', '_').downcase
  end

  def self.sort_and_sanitize(hash)
    hash.sort_by {|key, _| key}.each_with_object({}) do |(key, value), result|
      case value
      when Hash
        # ensure we always call sort_and_sanitize on the hash to avoid top-level empty objects
        sorted_hash = sort_and_sanitize(value)
        result[key] = sorted_hash unless sorted_hash.empty?
      when Array
        result[key] = value.filter_map {|v| v.is_a?(Hash) ? sort_and_sanitize(v) : v}
      when String
        result[key] = value.gsub(/\\r/, "\r") unless value.empty?
      else
        result[key] = value unless value.nil?
      end
    end
  end

  def self.sanitize_data_and_write(data, dest_path)
    sorted_data = sort_and_sanitize(data)

    dest_data =
      case File.extname(dest_path)
      when '.yaml', '.yml'
        sorted_data.to_yaml
      when '.json'
        JSON.pretty_generate(sorted_data)
      else
        raise "do not know how to serialize localization data to #{dest_path}"
      end

    FileUtils.mkdir_p(File.dirname(dest_path))
    File.write(dest_path, dest_data)
  end

  def self.parse_file(path)
    case File.extname(path)
    when '.yaml', '.yml'
      YAML.load_file(path)
    when '.json'
      JSON.load_file(path)
    else
      raise "do not know how to parse file #{path.inspect}"
    end
  end

  def self.sanitize_file_and_write(loc_path, dest_path)
    loc_data = parse_file(loc_path)
    sanitize_data_and_write(loc_data, dest_path)
  end

  def self.create_progress_bar(**args)
    ProgressBar.create(**args, format: PROGRESS_BAR_FORMAT)
  end

  def self.process_in_threads(data_array, **args)
    Parallel.each(data_array, **args, in_threads: PARALLEL_PROCESSES) {|data| yield(data)}
  end

  # Renames directory
  # @param [String] from_dir, e.g. `i18n/locales/English/resource`
  # @param [String] to_dir, e.g. `i18n/locales/en-US/resource`
  def self.rename_dir(from_dir, to_dir)
    FileUtils.mkdir_p(to_dir)
    FileUtils.cp_r File.join(from_dir, '.'), to_dir
    FileUtils.rm_r(from_dir)
  end

  def self.locale_dir(locale, *paths)
    CDO.dir(File.join(I18N_LOCALES_DIR, locale, *paths))
  end

  def self.delete_empty_crowdin_locale_dir(crowdin_locale)
    crowdin_locale_dir = locale_dir(crowdin_locale)

    return unless File.exist?(crowdin_locale_dir)
    return unless Dir.empty?(crowdin_locale_dir)

    FileUtils.rm_r(crowdin_locale_dir)
  end

  def self.find_malformed_links_images(locale, file_path)
    return unless File.exist?(file_path)

    data = parse_file(file_path) rescue nil
    return unless data&.values&.first&.length

    recursively_find_malformed_links_images(data, locale, file_path)
  end
end
