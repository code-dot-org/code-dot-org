require_relative './core_validator.rb'
require_relative '../../../lib/cdo/crowdin/client_extentions.rb'
require_relative 'data_io_helper'

class CrowdinValidator
  include CoreValidator
  include DataIOHelper

  CURRENT_DIR = File.dirname(__FILE__)
  CONFIG_DIR = File.join(CURRENT_DIR, 'configs')
  OUTPUT_DIR = File.join(CURRENT_DIR, 'outputs')

  CROWDIN_CREDENTIAL_FILE = File.join(CONFIG_DIR, 'crowdin_v2_credential.json')
  GOOGLE_DRIVE_CREDENTIAL_FILE = File.join(CONFIG_DIR, 'google_drive_credential.json')
  DEFAULT_CONFIG_FILE = File.join(CONFIG_DIR, 'crowdin_validator_configs.json')
  LANGUAGE_FILE = File.join(CONFIG_DIR, 'crowdin_validator_languages.json')

  REQUIRED_CONFIG_PARAMS = %w[
    user_name
    project_name
    crowdin_language_id
    start_date
    end_date
  ]

  SourceString = Struct.new(:id, :project_id, :file_id, :identifier, :text, :is_hidden, :is_icu, :created_at, :updated_at, keyword_init: true)
  Translation = Struct.new(:id, :string_id, :text, :crowdin_language_id, :user_id, :user_name, :created_at, keyword_init: true)

  def initialize(credential_file = CROWDIN_CREDENTIAL_FILE)
    api_token = read_from_json(credential_file)["api_token"]
    @crowdin_client = Crowdin::Client.new do |config|
      config.api_token = api_token
    end
    Dir.mkdir(OUTPUT_DIR) unless Dir.exist?(OUTPUT_DIR)
  end

  def run_config_file(config_file = DEFAULT_CONFIG_FILE)
    configs = read_from_json(config_file)

    limit = configs['limit'] || configs['data'].size
    shared_config = {'write_to_gsheet' => configs['write_to_gsheet'] || false}

    # TODO: failure handling, tolerate single config failure
    limit.times do |i|
      puts '=' * 50
      merged_config = configs['data'][i].merge(shared_config)
      puts merged_config
      run_single_config(merged_config)
    end
  end

  # Execute a configuration
  def run_single_config(config)
    # check config params
    missing_params = get_missing_params(config, REQUIRED_CONFIG_PARAMS)
    raise "Missing config params #{missing_params}" unless missing_params.empty?
    config.merge! infer_output_params(config)

    translations, source_strings = download_content(config)

    validate_content(translations, source_strings, config)
  end

  def get_missing_params(config, required_params)
    required_params.select do |param|
      config[param].nil? || config[param].empty?
    end
  end

  def infer_output_params(config)
    {}.tap do |output|
      output_folder = config['output_folder'] || OUTPUT_DIR
      file_prefix = config.values_at(*%w[user_name project_name crowdin_language_id start_date end_date]).join('_')
      output_prefix = "#{output_folder}/#{file_prefix}"

      output['translations_json'] = config['translations_json'] || "#{output_prefix}_translations.json"
      output['source_strings_json'] = config['source_strings_json'] || "#{output_prefix}_source_strings.json"

      output['errors_json'] = config['errors_json'] || "#{output_prefix}_errors.json"
      output['errors_csv'] = config['errors_csv'] || "#{output_prefix}_errors.csv"
      gsheet_path = "#{config['user_name']}_#{config['project_name']}"
      output['errors_gsheet'] = config['errors_gsheet'] || gsheet_path
    end
  end

  def download_content(config, output_to_file = true)
    # download translations
    translations = @crowdin_client.download_translations(
      config['project_name'],
      config['crowdin_language_id'],
      config['user_name'],
      config['start_date'],
      config['end_date']
    )
    if output_to_file
      write_to_json(translations, config['translations_json'])
      puts "Wrote translations to #{config['translations_json']}"
    end

    # download source strings
    source_strings = @crowdin_client.download_source_strings(
      config['project_name'],
      config['crowdin_language_id'],
      config['user_name'],
      config['start_date'],
      config['end_date']
    )
    if output_to_file
      write_to_json(source_strings, config['source_strings_json'])
      puts "Wrote source strings to #{config['source_strings_json']}"
    end

    [translations, source_strings]
  end

  # For rerun/retry purpose without downloading again
  def validate_content_from_files(config)
    translations ||= read_from_json(config['translations_json'])
    source_strings ||= read_from_json(config['source_strings_json'])
    validate_content(config, translations, source_strings)
  end

  # read from files and process
  # TODO: add comment for required params in config
  def validate_content(translations, source_strings, config, output_to_file = true)
    transformed_translations = transform_translations(translations)
    transformed_source_strings = transform_sources(source_strings)

    errors = []
    transformed_translations.each_pair do |str_id, str_translations|
      # TODO: analyze only the latest translation for a string. OR sort strings by translated_date
      # puts "%s, %d translations, in source strings? %s" % [string_id, trans.size, sources.has_key?(string_id)]
      source_string = transformed_source_strings[str_id]
      str_translations.each_value do |str_translation|
        errors.concat(validate_single_translation(source_string, str_translation))
      end
    end
    puts "Found #{errors.size} errors!"

    if output_to_file
      write_to_json errors, config['errors_json']
      puts "Wrote errors to #{config['errors_json']}"

      error_rows = convert_to_csv_rows(errors)
      write_to_csv error_rows, config['errors_csv']
      puts "Wrote errors to #{config['errors_csv']}"

      if config['write_to_gsheet']
        write_to_gsheet error_rows, config['errors_gsheet'], config['crowdin_language_id'], GOOGLE_DRIVE_CREDENTIAL_FILE
        puts "Wrote errors to #{config['errors_gsheet']} gsheet"
      end
    end
  end

  # @param source_strings [Array<Hash>]
  # @return Hash{string_id => SourceString}
  def transform_sources(source_strings)
    {}.tap do |res|
      source_strings.each do |data|
        string_id = data['id']
        raise 'string_id must not be nil' if string_id.nil?

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

  # @param translations [Array<Hash>]
  # @return Hash{string_id => Hash{translation_id => Translation}}
  def transform_translations(translations)
    {}.tap do |res|
      translations.each do |data|
        string_id = data['stringId']
        translation_id = data['translationId']
        user_id = data.dig('user', 'id')
        raise 'string_id must not be nil' if string_id.nil?
        raise 'translation_id must not be nil' if translation_id.nil?
        raise 'user_id must not be nil' if user_id.nil?

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

  # @param source [SourceString]
  # @param translation [Translation]
  # @return Array<Hash>
  def validate_single_translation(source, translation)
    # run all validators
    error_messages = []
    error_messages << validate_redacted_blocks(translation.text)
    error_messages << validate_markdown_link(translation.text)

    languages = load_languages
    accepted_languages = languages[translation.crowdin_language_id]['language_detector_code'] || translation.crowdin_language_id
    error_messages << validate_language(translation.text, accepted_languages)

    [].tap do |errors|
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

      error_messages.each do |error_message|
        next if error_message.nil? || error_message.empty?
        errors << common_info.merge({error_message: error_message}) unless error_message.empty?
      end
    end
  end

  # Load languages from file if file exists, if not download languages from Crowdin
  def load_languages(file_name = LANGUAGE_FILE)
    if @languages.nil?
      languages = read_from_json(file_name) if File.exist?(file_name)
      if languages.nil? || languages.empty?
        languages = @crowdin_client.download_languages
        write_to_json(languages, LANGUAGE_FILE)
      end
      @languages = languages
    end

    @languages
  end
end
