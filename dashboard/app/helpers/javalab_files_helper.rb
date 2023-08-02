module JavalabFilesHelper
  def self.upload_project_files(project_files, hostname, auth_token, upload_url)
    uri = URI.parse("#{upload_url}?Authorization=#{auth_token}")
    upload_request = Net::HTTP::Put.new(uri)
    upload_request['Origin'] = hostname
    upload_request['Content-Type'] = 'application/json'
    upload_request.body = project_files.to_json

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(upload_request)
    end
    return response
  rescue StandardError => exception
    event_details = {
      error_details: exception.to_json
    }
    NewRelic::Agent.record_custom_event("JavabuilderHttpConnectionError", event_details) if CDO.newrelic_logging
    nil
  end

  # Get all files related to the project at the given channel id as a hash.
  # Much of this can be constructed from the level where this project was created (get_level_files).
  # This method adds in user-specific code and assets uploaded on the level where the project was created.
  # The returned hash is in the format below. All values are strings.
  # {
  #   "sources": {"main.json": <main source file for a project>, "grid.txt": <serialized maze if it exists>},
  #   "assetUrls": {"asset_name_1": <asset_url>, ...}
  #   "validation": <all validation code for a project, in json format>
  # }
  # If the level doesn't have validation and/or a maze, those fields will not be present.
  def self.get_project_files(channel_id, level_id)
    all_files = get_level_files(level_id)

    # get main.json
    source_data = SourceBucket.new.get(channel_id, "main.json")
    all_files["sources"]["main.json"] = source_data[:body].string

    # get level assets
    get_assets_for_channel(channel_id, all_files)

    all_files
  end

  # Get all files for the project to be executed as a hash, with source code provided as an argument.
  # Much of this can be constructed from the level where this project was created (get_level_files).
  # This method adds in code provided the sources argument.
  # The returned hash is in the format below. All values are strings.
  # {
  #   "sources": {"main.json": <main source file for a project>, "grid.txt": <serialized maze if it exists>},
  #   "assetUrls": {"asset_name_1": <asset_url>, ...}
  #   "validation": <all validation code for a project, in json format>
  # }
  # If the level doesn't have validation and/or a maze, those fields will not be present.
  def self.get_project_files_with_override_sources(sources, level_id, channel_id)
    all_files = get_level_files(level_id)
    all_files["sources"]["main.json"] = {source: sources}.to_json
    get_assets_for_channel(channel_id, all_files) if channel_id
    all_files
  end

  # Get all files for the project to be executed as a hash, with validation code provided as an argument.
  # Much of this can be constructed from the level where this project was created (get_level_files).
  # This method adds in user-specific code and assets uploaded on the level where the project was created,
  # and the validation code that was passed in replaces any existing validation on the level.
  # The returned hash is in the format below. All values are strings.
  # {
  #   "sources": {"main.json": <main source file for a project>, "grid.txt": <serialized maze if it exists>},
  #   "assetUrls": {"asset_name_1": <asset_url>, ...}
  #   "validation": <all validation code for a project, in json format>
  # }
  # If the level doesn't have a maze, that field will not be present.
  def self.get_project_files_with_override_validation(channel_id, level_id, validation)
    all_files = get_project_files(channel_id, level_id)
    all_files["validation"] = {source: validation}.to_json
    all_files
  end

  # Get all files that can be derived from the level where a project was built (ie, files that are not user-specific).
  # The hash is in the format below. All values are strings.
  # Note that this hash does **not** include a "main.json" entry in under "sources", which is required for Javabuilder.
  # {
  #   "sources": {"grid.txt": <serialized maze if it exists>},
  #   "assetUrls": {"asset_name_1": <asset_url>, ...}
  #   "validation": <all validation code for a project, in json format>
  # }
  # If the level doesn't have validation and/or a maze, those fields will not be present.
  def self.get_level_files(level_id)
    all_level_files = {}
    sources = {}
    assets = {}

    level = Level.find(level_id)

    # get maze file
    serialized_maze = level.try(:get_serialized_maze)
    if serialized_maze
      sources["grid.txt"] = serialized_maze.to_json
    end
    all_level_files["sources"] = sources

    # get starter assets
    (level&.project_template_level&.starter_assets || level.starter_assets || []).map do |friendly_name, _|
      assets[friendly_name] = generate_starter_asset_url(friendly_name, level)
    end
    all_level_files["assetUrls"] = assets

    # get validation code
    if level.respond_to?(:validation) && level.validation
      validation = {}
      validation["source"] = level.validation
      all_level_files["validation"] = validation.to_json
    end

    all_level_files
  end

  def self.generate_asset_url(filename, channel_id)
    prefix = get_dashboard_url_prefix
    prefix + "/v3/assets/" + channel_id + "/" + filename
  end

  def self.generate_starter_asset_url(filename, level)
    prefix = get_dashboard_url_prefix
    prefix + "/level_starter_assets/" + ERB::Util.url_encode(level.name) + "/" + filename
  end

  def self.get_dashboard_url_prefix
    rack_env?(:development) ?
      "http://" + CDO.dashboard_hostname + ":3000" :
      "https://" + CDO.dashboard_hostname
  end

  def self.get_assets_for_channel(channel_id, all_level_files)
    asset_bucket = AssetBucket.new
    asset_list = asset_bucket.list(channel_id)
    asset_list.each do |asset|
      all_level_files["assetUrls"][asset[:filename]] = generate_asset_url(asset[:filename], channel_id)
    end
  end
end
