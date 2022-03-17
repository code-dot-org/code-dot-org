module JavalabFilesHelper
  def self.upload_project_files(project_files, hostname, auth_token)
    uri = URI.parse("#{CDO.javabuilder_upload_url}?Authorization=#{auth_token}")
    upload_request = Net::HTTP::Put.new(uri)
    upload_request['Origin'] = hostname
    upload_request['Content-Type'] = 'application/json'
    upload_request.body = project_files.to_json

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(upload_request)
    end
    response.code == '200'
  rescue StandardError
    false
  end

  # Get all files related to the project at the given channel id as a hash.
  # Much of this can be constructed from the level where this project was created (get_level_project_files).
  # This method adds in user-specific code and assets uploaded on the level where the project was created.
  # The returned hash is in the format below. All values are strings.
  # {
  #   "sources": {"main.json": <main source file for a project>, "grid.txt": <serialized maze if it exists>},
  #   "assetUrls": {"asset_name_1": <asset_url>, ...}
  #   "validation": <all validation code for a project, in json format>
  # }
  # If the level doesn't have validation and/or a maze, those fields will not be present.
  def self.get_project_files(channel_id, level_id)
    all_files = get_level_project_files(level_id)

    # get main.json
    source_data = SourceBucket.new.get(channel_id, "main.json")
    all_files["sources"]["main.json"] = source_data[:body].string

    # get level assets
    asset_bucket = AssetBucket.new
    asset_list = asset_bucket.list(channel_id)
    asset_list.each do |asset|
      all_files["assetUrls"][asset[:filename]] = generate_asset_url(asset[:filename], channel_id)
    end

    return all_files
  end

  # def self.get_project_files_with_provided_sources(sources, level_id)

  def self.generate_asset_url(filename, channel_id)
    prefix = get_dashboard_url_prefix
    prefix + "/v3/assets/" + channel_id + "/" + filename
  end

  def self.generate_starter_asset_url(filename, level)
    prefix = get_dashboard_url_prefix
    prefix + "/level_starter_assets/" + URI.encode(level.name) + "/" + filename
  end

  def self.get_dashboard_url_prefix
    rack_env?(:development) ?
      "http://" + CDO.dashboard_hostname + ":3000" :
      "https://" + CDO.dashboard_hostname
  end

  def self.get_javabuilder_uri(auth_token)
    URI.parse("#{CDO.javabuilder_upload_url}?Authorization=#{auth_token}")
  end

  def self.create_default_javabuilder_request(uri, hostname)
    default_javabuilder_request = Net::HTTP::Put.new(uri)
    default_javabuilder_request['Origin'] = hostname
    default_javabuilder_request['Content-Type'] = 'application/json'

    default_javabuilder_request
  end

  # Get all files that can be derived from the level where a project was built (ie, files that are not user-specific).
  # The hash is in the format below. All values are strings.
  # Note that this hash does not include a "main.json" entry in under "sources", which is required for Javabuilder.
  # {
  #   "sources": {"grid.txt": <serialized maze if it exists>},
  #   "assetUrls": {"asset_name_1": <asset_url>, ...}
  #   "validation": <all validation code for a project, in json format>
  # }
  # If the level doesn't have validation and/or a maze, those fields will not be present.
  def self.get_level_project_files(level_id)
    default_files = {}
    default_sources = {}
    default_assets = {}

    # get maze file
    level = Level.find(level_id)
    if level
      serialized_maze = level.try(:get_serialized_maze)
      if serialized_maze
        default_sources["grid.txt"] = serialized_maze.to_json
      end
    end
    default_files["sources"] = default_sources

    # get starter assets
    if level
      (level&.project_template_level&.starter_assets || level.starter_assets || []).map do |friendly_name, _|
        default_assets[friendly_name] = generate_starter_asset_url(friendly_name, level)
      end
    end
    default_files["assetUrls"] = default_assets

    # get validation code
    if level.respond_to?(:validation) && level.validation
      default_files["validation"] = level.validation.to_json
    end

    default_files
  end
end
