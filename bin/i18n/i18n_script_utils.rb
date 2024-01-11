require File.expand_path('../../../dashboard/config/environment', __FILE__)
require File.expand_path('../../../pegasus/helpers/pegasus_languages', __FILE__)

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
    config_file:            CDO.dir('bin/i18n/crowdin/config/codeorg_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/etags/codeorg_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/codeorg_files_to_sync_out.json')
  },
  'codeorg-markdown': {
    config_file:            CDO.dir('bin/i18n/crowdin/config/codeorg_markdown_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/etags/codeorg-markdown_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/codeorg-markdown_files_to_sync_out.json')
  },
  'hour-of-code': {
    config_file:            CDO.dir('bin/i18n/crowdin/config/hourofcode_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/etags/hour-of-code_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/hour-of-code_files_to_sync_out.json')
  },
  'codeorg-restricted': {
    config_file:            CDO.dir('bin/i18n/crowdin/config/codeorg_restricted_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/etags/codeorg-restricted_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/codeorg-restricted_files_to_sync_out.json')
  },
}.freeze

CROWDIN_TEST_PROJECTS = {
  'codeorg-testing': {
    config_file:            CDO.dir('bin/i18n/crowdin/config/codeorg-testing_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/etags/codeorg-testing_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/codeorg-testing_files_to_sync_out.json')
  },
  'codeorg-markdown-testing': {
    config_file:            CDO.dir('bin/i18n/crowdin/config/codeorg-markdown-testing_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/etags/codeorg-markdown-testing_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/codeorg-testing_markdown_files_to_sync_out.json')
  },
  'hour-of-code-test': {
    config_file:            CDO.dir('bin/i18n/crowdin/config/hourofcode-testing_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/etags/hour-of-code-testing_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/hour-of-code-test_files_to_sync_out.json')
  },
  'codeorg-restricted-test': {
    config_file:            CDO.dir('bin/i18n/crowdin/config/codeorg-restricted-testing_crowdin.yml'),
    identity_file:          CDO.dir('bin/i18n/crowdin_credentials.yml'),
    etags_json:             CDO.dir('bin/i18n/crowdin/etags/codeorg-restricted-testing_etags.json'),
    files_to_sync_out_json: CDO.dir('bin/i18n/crowdin/codeorg-restricted-test_files_to_sync_out.json')
  },
}.freeze

class I18nScriptUtils
  PROGRESS_BAR_FORMAT = '%t: |%B| %p% %a'.freeze
  PARALLEL_PROCESSES = Parallel.processor_count / 2
  SOURCE_LOCALE = 'en-US'.freeze
  TTS_LOCALES = (::TextToSpeech::VOICES.keys - %i[en-US]).freeze

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

  def self.get_level_url_key(script, level)
    script_level = level.script_levels.find_by_script_id(script.id)
    path = script_level.build_script_level_path(script_level)
    URI.join("https://studio.code.org", path)
  end

  # Used by get_level_from_url, for the script_level-specific case.
  def self.get_script_level(route_params, url)
    script = begin
      Unit.get_from_cache(route_params[:script_id])
    rescue ActiveRecord::RecordNotFound => _exception
      nil
    end

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
  # @param locale [String] the BCP 47 (IETF language tag) format (e.g., 'en-US')
  # @return [String] the BCP 47 (IETF language tag) JS format (e.g., 'en_us')
  def self.to_js_locale(locale)
    locale.to_s.tr('-', '_').downcase
  end

  # Wraps hash in correct format to be loaded by our i18n backend.
  # This will most likely be JSON file data due to Crowdin only
  # setting the locale for yml files.
  def self.to_dashboard_i18n_data(locale, type, i18n_data)
    {locale => {'data' => {type => i18n_data}}}
  end

  # Removes dots ( . ) from a given string.
  # We frequently use strigns with dots as keys in our i18n data,
  # as the come from course and curriculum content.
  # The I18n gem uses dots to denote hierarchy in keys, so we need to remove them.
  def self.to_i18n_key(string)
    string.gsub(I18n.default_separator, '')
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

  def self.json_file?(file_path)
    %w[.json].include?(File.extname(file_path).downcase)
  end

  def self.yaml_file?(file_path)
    %w[.yaml .yml].include?(File.extname(file_path).downcase)
  end

  def self.sanitize_data_and_write(data, dest_path)
    dest_data = sort_and_sanitize(data)

    dest_data = JSON.pretty_generate(dest_data) if json_file?(dest_path)
    dest_data = YAML.dump(dest_data) if yaml_file?(dest_path)

    write_file(dest_path, dest_data)
  end

  def self.parse_file(file_path)
    return JSON.load_file(file_path) if json_file?(file_path)
    return YAML.load_file(file_path) if yaml_file?(file_path)

    raise "do not know how to parse file #{file_path.inspect}"
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

  # Writes file
  #
  # @param file_path [String] path to the file
  # @param content [String] the file content
  def self.write_file(file_path, content)
    FileUtils.mkdir_p(File.dirname(file_path))
    File.write(file_path, content)
  end

  # Writes json file
  #
  # @param file_path [String] path to the file
  # @param data [Hash] the file content
  def self.write_json_file(file_path, data)
    write_file file_path, JSON.pretty_generate(data)
  end

  # Writes yaml file
  #
  # @param file_path [String] path to the file
  # @param data [Hash] the file content
  def self.write_yaml_file(file_path, data)
    write_file file_path, to_crowdin_yaml(data)
  end

  # Copies file
  #
  # @param file_path [String] path to the file
  # @param dest_path [String] destination path
  def self.copy_file(file_path, dest_path)
    dest_dir = File.extname(dest_path).empty? ? dest_path : File.dirname(dest_path)
    FileUtils.mkdir_p(dest_dir)
    FileUtils.cp(file_path, dest_path)
  end

  # Moves file
  #
  # @param file_path [String] path to the file
  # @param dest_path [String] destination path
  def self.move_file(file_path, dest_path)
    dest_dir = File.extname(dest_path).empty? ? dest_path : File.dirname(dest_path)
    FileUtils.mkdir_p(dest_dir)
    FileUtils.mv(file_path, dest_path, force: true)
  end

  # Renames directory
  #
  # @param from_dir [String] the original directory path name, e.g. `i18n/locales/English/resource`
  # @param to_dir [String] the new directory path name, e.g. `i18n/locales/en-US/resource`
  def self.rename_dir(from_dir, to_dir)
    FileUtils.mkdir_p(to_dir)
    FileUtils.cp_r File.join(from_dir, '.'), to_dir
    FileUtils.rm_r(from_dir)
  end

  def self.locale_dir(locale, *paths)
    CDO.dir(I18N_LOCALES_DIR, locale, *paths)
  end

  def self.remove_empty_dir(dir)
    return unless File.directory?(dir)
    return unless Dir.empty?(dir)

    FileUtils.rm_r(dir)
  end

  # Checks if the language is the i18n source language
  #
  # @param lang [PegasusLanguage] a pegasus language object
  # @return [true, false]
  def self.source_lang?(lang)
    lang[:locale_s] == SOURCE_LOCALE
  end
end
