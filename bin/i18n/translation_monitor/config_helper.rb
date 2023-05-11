#
# A helper module that can parse CrowdinValidator's configuration file.
#
module ConfigHelper
  # A valid configuration must have 3 fields
  #   user_names (in Crowdin): an array of names, e.g. tomedes, translatebyhumans
  #   project_name (in Crowdin): e.g. codeorg, hour-of-code, codeorg-markdown, codeorg-restricted
  #   crowdin_language_id: e.g. it, es-MX. See https://developer.crowdin.com/language-codes/
  REQUIRED_CONFIG_PARAMS = %w[
    user_names
    project_name
    crowdin_language_id
  ]

  # Optional fields in a configuration. They will take default values if not
  # explicitly specified. See the +merge_default_params+ function in this module.
  #   user_group: identify a group of users. If not set, takes the first value from the user_names array
  #   start_date: e.g. 2022-01-01 (yyyy-mm-dd). See https://developer.crowdin.com/croql/
  #   end_date: e.g. 2022-06-23
  #   write_to_file: if true, the tool will write the translations, source strings, and translation errors to the local file system
  #   write_to_gsheet: if true, the tool will write translation errors to Google Sheet
  #   translations_json: output JSON file for translations downloaded from Crowdin
  #   source_strings_json: output JSON file for source strings downloaded from Crowdin
  #   errors_json: output JSON file for translation errors
  #   errors_csv: output CSV file for translation errors
  #   errors_gsheet: output Google Sheet for translation errors
  #     Note: The Google Sheet file must be created by a Code.org member.
  #     We then grant an editor right to the +i18n-logging+ Google service account.
  #     The service account won't try to create a new Google file.
  #     See +append_to_gsheet+ function in the DataIOHelper module.
  OPTIONAL_CONFIG_PARAMS = %w[
    user_group
    start_date
    end_date
    write_to_file
    write_to_gsheet
    translations_json
    source_strings_json
    errors_json
    errors_csv
    errors_gsheet
  ]

  DATE_FORMAT = '%Y-%m-%d'
  DEFAULT_START_DATE = '2022-01-01'

  # Parse a JSON configuration file and return an array of valid configs.
  #
  # A JSON configuration file has 3 main fields.
  # +data+ (required): an array of hashes. Each hash is a config.
  # +shared_data+ (optional): a hash. Shared parameters used in all configs.
  # +limit+ (optional): an integer or null. How many configs we want to run; if missing or set to null, run all configs.
  #
  # @param config_file [String]
  # @return [Array<Hash>]
  def parse_config_file(config_file)
    file_content = read_from_json(config_file)
    data = file_content['data']
    raise 'Missing required field: data' if data.nil? || data.empty?

    shared_data = file_content['shared_data']

    limit = file_content['limit'] || data.size
    Array.new(limit) do |i|
      # Explict config data will overwrite the shared data
      config = shared_data.merge(data[i])

      missing_params = find_missing_params(config, REQUIRED_CONFIG_PARAMS)
      raise "Missing config params #{missing_params} in config #{config}" unless missing_params.empty?

      # Explicit config data will overwrite the default data
      merge_default_params(config)
    end
  end

  # Check if the input config has all the required parameters.
  # @param config [Hash]
  # @param required_params [Array<String>]
  # @return [Array<String>]
  def find_missing_params(config, required_params)
    required_params.select do |param|
      config[param].nil? || config[param].empty?
    end
  end

  # Merge a config with the default values for date range and output locations.
  # Explicit config params overwrite the default values.
  #
  # Note: this function changes the input config.
  #
  # @param config [Hash]
  # @return [Hash] a modified config
  def merge_default_params(config)
    config['user_group'] ||= config['user_names'].first

    # date range
    config['start_date'] ||= DEFAULT_START_DATE
    config['end_date'] ||= Time.now.utc.strftime(DATE_FORMAT)

    # local file outputs
    output_prefix = "#{CrowdinValidator::OUTPUT_DIR}/#{create_config_key_with_date_range(config)}"
    config['translations_json'] ||= "#{output_prefix}_translations.json"
    config['source_strings_json'] ||= "#{output_prefix}_source_strings.json"
    config['errors_json'] ||= "#{output_prefix}_errors.json"
    config['errors_csv'] ||= "#{output_prefix}_errors.csv"

    # gsheet output
    config['errors_gsheet'] ||= "#{config['user_group']}_#{config['project_name']}"
    config
  end

  # Create a synthetic key for a config from its required params.
  # @param config [Hash]
  # @return [String]
  def create_config_key(config)
    keys = %w[user_group project_name crowdin_language_id]
    config.values_at(*keys).join('_')
  end

  # Create a detailed synthetic key for a config from its required params and date params.
  # @param config [Hash]
  # @return [String]
  def create_config_key_with_date_range(config)
    keys = %w[user_group project_name crowdin_language_id start_date end_date]
    config.values_at(*keys).join('_')
  end

  # Update the input +congfigs+ using history of the last successful runs.
  # @param configs [Array<Hash>]
  # @param history [Hash]
  def update_configs_with_history(configs, history)
    configs.each do |config|
      config_key = create_config_key(config)
      last_successful_date = history.dig(config_key, 'end_date')

      # Update the +start_date+ by assuming that all data before the last successful date has been processed.
      config['start_date'] = last_successful_date if last_successful_date
    end
  end
end
