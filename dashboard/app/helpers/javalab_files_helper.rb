
module JavalabFilesHelper
  def self.upload_project_files(channel_id, level_id, hostname, auth_token)
    uri = URI.parse("#{CDO.javabuilder_upload_url}?Authorization=#{auth_token}")
    upload_request = Net::HTTP::Put.new(uri)
    upload_request['Origin'] = hostname
    upload_request.body = get_project_files(channel_id, level_id).to_json

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(upload_request)
    end
    response.code == '200'
  rescue StandardError
    false
  end

  # Get all files related to the project at the given channel id as a hash. The hash is in the format
  # below. All values are strings.
  # {
  #   "sources": {"main.json": <main source file for a project>, "grid.txt": <serialized maze if it exists>},
  #   "assetUrls": {"asset_name_1": <asset_url>, ...}
  #   "validation": <all validation code for a project, in json format>
  # }
  # If the channel doesn't have validation and/or a maze, those fields will not be present.
  def self.get_project_files(channel_id, level_id)
    all_files = {}
    sources = {}
    # get main.json
    source_data = SourceBucket.new.get(channel_id, "main.json")
    sources["main.json"] = source_data[:body].string

    # get maze file
    level = Level.find(level_id)
    if level
      serialized_maze = level.try(:get_serialized_maze)
      if serialized_maze
        sources["grid.txt"] = serialized_maze.to_json
      end
    end
    all_files["sources"] = sources

    # get level assets
    assets = {}
    asset_bucket = AssetBucket.new
    asset_list = asset_bucket.list(channel_id)
    asset_list.each do |asset|
      assets[asset[:filename]] = generate_asset_url(asset[:filename], channel_id)
    end

    # get starter assets
    if level
      (level&.project_template_level&.starter_assets || level.starter_assets || []).map do |friendly_name, _|
        assets[friendly_name] = generate_starter_asset_url(friendly_name, level)
      end
    end
    all_files["assetUrls"] = assets

    # get validation code
    if level.respond_to?(:validation) && level.validation
      all_files["validation"] = level.validation.to_json
    end

    return all_files
  end

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
end
