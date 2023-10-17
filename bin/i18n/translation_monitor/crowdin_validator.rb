require_relative 'core_validator'
require_relative 'data_io_helper'
require_relative 'config_helper'
require_relative '../../../lib/cdo/crowdin/client_extentions'

#
# A tool to download and validate translations made by specific users/vendors in Crowdin.
# Can run frequently as a cronjob.
#
class CrowdinValidator
  include CoreValidator
  include DataIOHelper
  include ConfigHelper

  CURRENT_DIR = File.dirname(__FILE__)
  CONFIG_DIR = File.join(CURRENT_DIR, 'configs')
  OUTPUT_DIR = File.join(CURRENT_DIR, 'outputs')

  CROWDIN_CREDENTIAL_FILE = File.join(CONFIG_DIR, 'crowdin_v2_credential.json')
  GOOGLE_DRIVE_CREDENTIAL_FILE = File.join(CONFIG_DIR, 'google_drive_credential.json')
  CONFIG_FILE = File.join(CONFIG_DIR, 'crowdin_validator_config.json')
  HISTORY_FILE = File.join(CONFIG_DIR, 'crowdin_validator_history.json')
  LANGUAGE_FILE = File.join(CONFIG_DIR, 'crowdin_validator_languages.json')

  SourceString = Struct.new(:id, :project_id, :file_id, :identifier, :text, :is_hidden, :is_icu, :created_at, :updated_at, keyword_init: true)
  Translation = Struct.new(:id, :string_id, :text, :crowdin_language_id, :user_id, :user_name, :created_at, keyword_init: true)

  def initialize(credential_file = CROWDIN_CREDENTIAL_FILE)
    api_token = read_from_json(credential_file)["api_token"]
    @crowdin_client = Crowdin::Client.new do |config|
      config.api_token = api_token
    end
    FileUtils.mkdir_p(OUTPUT_DIR)
  end

  # Load configurations from a config file and run them all.
  # May combine with a history file to skip already processed data.
  #
  # If +dry_run+ is set to true, this function has no side effects.
  # Otherwise, it may write to local files and Google Drive.
  #
  # If +download_from_crowdin+ is set to false, this function will load
  # existing translations and source strings from local files instead of Crowdin.
  # This option is helpful during development and debugging process.
  #
  # @param config_file [String]
  # @param history_file [String]
  # @param dry_run [Boolean]
  # @param download_from_crowdin [Boolean]
  #
  def run_all_configs(config_file:, history_file: nil, dry_run: false, download_from_crowdin: true)
    # Read configs from file
    configs = parse_config_file(config_file)

    # Update configs using the history of last successful runs
    history = {}
    if history_file && File.exist?(history_file)
      history = read_from_json(history_file)
      update_configs_with_history(configs, history)
    end

    # Execute all configs, one by one
    configs.each do |config|
      puts '=' * 50
      puts "Executing config: #{config}"

      begin
        translations, source_strings, errors = run_config(config, dry_run, download_from_crowdin)

        # Save the last successful runs to the history file
        if history_file
          config_with_results = config.merge(
            {
              'results' => {
                'translation_count' => translations.size,
                'source_string_count' => source_strings.size,
                'error_count' => errors.size,
                'processed_time' => Time.now.to_s
              }
            }
          )
          config_key = create_config_key(config)
          history[config_key] = config_with_results

          if dry_run
            puts "\n[Dry-run] Will write history to file #{history_file}:"
            puts "[History] #{history}"
          else
            write_to_json(history, history_file)
            puts "Wrote history to file #{history_file}"
          end
        end
      rescue Exception => exception
        puts "Error: #{exception.message}"
        puts exception.backtrace
      end
    end
  end

  # Run a single configuration.
  #
  # If +dry_run+ is set to true, this function has no side effects.
  # Otherwise, it may write to local files and Google Drive.
  #
  # @param config [Hash] a valid configuration to run
  # @param dry_run [Boolean] if true, will not write to the local file system and gsheet
  # @param download_from_crowdin [Boolean] if true, download data from Crowdin. Otherwise load existing data from local files
  # @return [Array<Array>] array of translations, source_strings, and translation errors
  #
  def run_config(config, dry_run, download_from_crowdin)
    # Retreive translations
    if download_from_crowdin
      translations = @crowdin_client.download_translations(
        config['project_name'],
        config['crowdin_language_id'],
        config['user_names'],
        config['start_date'],
        config['end_date']
      )
      puts "Downloaded #{translations.size} translations from Crowdin"

      if config['write_to_file']
        if dry_run
          puts "\n[Dry-run] Will write #{translations.size} translations to file #{config['translations_json']}:"
          translations.each {|transltion| puts "[Translation] #{transltion}"}
        else
          write_to_json(translations, config['translations_json'])
          puts "Wrote #{translations.size} translations to file #{config['translations_json']}"
        end
      end
    else
      translations = read_from_json(config['translations_json'])
      puts "Loaded #{translations.size} translations from file #{config['translations_json']}"
    end

    # Retreive source strings
    if download_from_crowdin
      source_strings = @crowdin_client.download_source_strings(
        config['project_name'],
        config['crowdin_language_id'],
        config['user_names'],
        config['start_date'],
        config['end_date']
      )
      puts "Downloaded #{source_strings.size} source strings from Crowdin"

      if config['write_to_file']
        if dry_run
          puts "\n[Dry-run] Will write #{source_strings.size} source strings to #{config['source_strings_json']}:"
          source_strings.each {|source_string| puts "[SourceString] #{source_string}"}
        else
          write_to_json(source_strings, config['source_strings_json'])
          puts "Wrote #{source_strings.size} source strings to #{config['source_strings_json']}"
        end
      end
    else
      source_strings = read_from_json(config['source_strings_json'])
      puts "Loaded #{translations.size} translations from file #{config['source_strings_json']}"
    end

    # Find all translation errors
    errors = validate_all_translations(translations, source_strings)

    # Write errors to local files and/or gsheet
    if errors.empty?
      puts "No errors found in #{translations.size} translations"
    else
      error_rows_with_headers = convert_to_csv_rows(errors)
      if config['write_to_file']
        if dry_run
          puts "\n[Dry-run] Will write #{errors.size} errors to file #{config['errors_json']} and #{config['errors_csv']}"
        else
          write_to_json errors, config['errors_json']
          puts "Wrote #{errors.size} errors to file #{config['errors_json']}"
          write_to_csv error_rows_with_headers, config['errors_csv']
          puts "Wrote #{errors.size} errors to file #{config['errors_csv']}"
        end
      end

      if config['write_to_gsheet']
        if dry_run
          puts "\n[Dry-run] Will write #{errors.size} errors to '#{config['crowdin_language_id']}' tab in #{config['errors_gsheet']} gsheet"
        else
          append_to_gsheet error_rows_with_headers, config['errors_gsheet'], config['crowdin_language_id'], GOOGLE_DRIVE_CREDENTIAL_FILE
          puts "Wrote #{errors.size} errors to '#{config['crowdin_language_id']}' tab in #{config['errors_gsheet']} gsheet"
        end
      end

      errors.each {|error| puts "[Error] #{error}"} if dry_run
    end

    [translations, source_strings, errors]
  end

  private

  # Validate multiple translations.
  # @param translations [Array<Hash>]
  # @param source_strings [Array<Hash>]
  # @return [Array<Hash>] array of translation errors
  def validate_all_translations(translations, source_strings)
    # Transform data structure from an array to a hash for faster lookup using string_id
    transformed_translations = transform_translations(translations)
    transformed_source_strings = transform_source_strings(source_strings)

    # Match translations to their source strings, then validate them
    errors = []
    transformed_translations.each_pair do |str_id, str_translations|
      source_string = transformed_source_strings[str_id]
      str_translations.each_value do |str_translation|
        errors.concat(validate_translation(str_translation, source_string))
      end
    end

    puts "Found #{errors.size} errors!"
    errors
  end

  # Validate one translation.
  # @param source [SourceString]
  # @param translation [Translation]
  # @return [Array<Hash>] array of translation errors
  def validate_translation(translation, source)
    # Validate redaction blocks
    error_messages = []
    error_messages << validate_redacted_blocks(translation.text)

    # Validate markdown content
    error_messages << validate_markdown_link(translation.text)

    languages = load_languages

    # Temporarily disable language validation due to high false-negative rate
    # (saying something is false when it is actually true). E.g. it mistakes Czech
    # to be Slovak, and Indonesian to be Malay.
    # TODO: turn on language validation once we can use it effectively.
    # accepted_languages = languages[translation.crowdin_language_id]['language_detector_code'] || translation.crowdin_language_id
    # error_messages << validate_language(translation.text, accepted_languages)

    # Combine error messages found by the validation functions with
    # other useful information to help translators fixing errors faster.
    crowdin_editor_code = languages[translation.crowdin_language_id]['editor_code']
    project_name = Crowdin::Client::CDO_PROJECT_IDS.key(source.project_id)
    project_source_language = Crowdin::Client::CDO_PROJECT_SOURCE_LANGUAGES[project_name]
    crowdin_link = "https://crowdin.com/translate/#{project_name}/#{source.file_id}/#{project_source_language}-#{crowdin_editor_code}##{source.id}"
    common_info = {
      string_id: source.id,
      string: source.text,
      string_created_at: source.created_at,
      translation_id: translation.id,
      translation: translation.text,
      translator_id: translation.user_id,
      translator_user_name: translation.user_name,
      translation_created_at: translation.created_at,
      crowdin_link: crowdin_link
    }

    [].tap do |errors|
      error_messages.each do |error_message|
        next if error_message.nil? || error_message.empty?
        errors << common_info.merge({error_message: error_message}) unless error_message.empty?
      end
    end
  end

  # Transform an array of translation to a hash for faster lookup.
  # @param translations [Array<Hash>]
  # @return [Hash{string_id => Hash{translation_id => Translation}}]
  def transform_translations(translations)
    {}.tap do |res|
      translations.each do |data|
        string_id = data['stringId']
        translation_id = data['translationId']
        user_id = data.dig('user', 'id')

        res[string_id] ||= {}
        res[string_id][translation_id] = Translation.new(
          id: translation_id,
          string_id: string_id,
          text: data['text'],
          crowdin_language_id: data['crowdin_language_id'],
          user_id: user_id,
          user_name: data.dig('user', 'username'),
          created_at: data['createdAt']
        )
      end
    end
  end

  # Transform an array of source strings to a hash for faster lookup.
  # @param source_strings [Array<Hash>]
  # @return [Hash{string_id => SourceString}]
  def transform_source_strings(source_strings)
    {}.tap do |res|
      source_strings.each do |data|
        string_id = data['id']
        res[string_id] = SourceString.new(
          id: string_id,
          project_id: data['projectId'],
          file_id: data['fileId'],
          identifier: data['identifier'],
          text: data['text'],
          is_hidden: data['isHidden'],
          is_icu: data['isIcu'],
          created_at: data['createdAt'],
          updated_at: data['updatedAt']
        )
      end
    end
  end

  # Get mappings from Crowdin's language_code to Crowdin's language_name,
  # Crowdin's editor_code, and Google CLD's language_detector_code.
  #
  # Note: The language_detector_code field only exists if its value is different
  # from Crowdin's language_code.
  #
  # @see https://developer.crowdin.com/language-codes/ for Crowdin language codes and names
  # @see https://developer.crowdin.com/api/v2/#operation/api.languages.getMany for Crowdin language names and editor codes
  # @see https://github.com/google/cld3#supported-languages for language_detector_code(s) for the Google Compact Language Detector
  #
  # @return [Hash]
  def load_languages(file_name = LANGUAGE_FILE)
    @languages = read_from_json(file_name) if @languages.nil? && File.exist?(file_name)
    @languages
  end
end
