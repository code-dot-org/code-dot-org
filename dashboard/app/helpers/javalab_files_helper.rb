require 'cdo/request_tracing'

module JavalabFilesHelper
  def self.upload_project_files(project_files, hostname, auth_token, upload_url, request_id: nil)
    uri = URI.parse("#{upload_url}?Authorization=#{auth_token}")
    upload_request = Net::HTTP::Put.new(uri)
    upload_request['Origin'] = hostname
    upload_request['Content-Type'] = 'application/json'
    upload_request['X-Request-Id'] = request_id if request_id.present?
    traceparent = RequestTracing.current_traceparent
    upload_request['traceparent'] = traceparent if traceparent.present?
    upload_request.body = project_files.to_json

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(upload_request)
    end
    return response
  rescue StandardError => exception
    span = OpenTelemetry::Trace.current_span
    span.set_attribute('JavabuilderHttpConnectionError', true)
    span.set_attribute('JavabuilderHttpConnectionError.error_details', exception.to_json)
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
    all_files["sources"]["main.json"] = strip_and_extract_assets(source_data[:body].string, all_files["assetUrls"])

    # get level assets.
    # TODO: determine if this is needed for lab2. We may be able to skip this as if it's not needed for
    # backwards compatiblity.
    get_assets_for_channel(channel_id, all_files)

    all_files
  end

  # Get all files for the project to be executed as a hash, with source code provided as an argument.
  # Much of this can be constructed from the level where this project was created (get_level_files).
  # This method adds in code provided the sources argument.
  # When override_validation is provided, it replaces any validation defined on the level. This lets
  # a levelbuilder test in-memory validation edits before saving them to the level.
  # The returned hash is in the format below. All values are strings.
  # {
  #   "sources": {"main.json": <main source file for a project>, "grid.txt": <serialized maze if it exists>},
  #   "assetUrls": {"asset_name_1": <asset_url>, ...}
  #   "validation": <all validation code for a project, in json format>
  # }
  # If the level doesn't have validation and/or a maze, those fields will not be present.
  def self.get_project_files_with_overrides(sources, level_id, channel_id, override_validation = nil)
    all_files = get_level_files(level_id)
    sources = sources.to_unsafe_h if sources.respond_to?(:to_unsafe_h)
    sources = extract_asset_entries(sources, all_files["assetUrls"]) if sources.is_a?(Hash)
    all_files["sources"]["main.json"] = {source: sources}.to_json
    all_files["validation"] = {source: override_validation}.to_json if override_validation
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

  # Lab2 Java Lab stores asset (image/audio) files in the source as entries
  # with a "url" pointing at where the bytes live. Javabuilder only
  # understands code files plus the assetUrls map, so pull those entries out
  # of the main.json blob and fold them into asset_urls. Blobs that aren't
  # the expected {source: {filename => {...}}} shape pass through untouched.
  def self.strip_and_extract_assets(main_json, asset_urls)
    # Url entries are the only thing to strip, so skip the parse + reserialize
    # round-trip if there are no urls.
    return main_json unless main_json.include?('"url"')
    parsed = JSON.parse(main_json)
    return main_json unless parsed.is_a?(Hash) && parsed["source"].is_a?(Hash)
    parsed["source"] = extract_asset_entries(parsed["source"], asset_urls)
    parsed.to_json
  rescue JSON::ParserError, TypeError
    main_json
  end

  # Remove url-backed entries from a flat source hash, recording each in
  # asset_urls as filename => absolute URL. Returns the remaining entries.
  def self.extract_asset_entries(source, asset_urls)
    source.reject do |filename, file|
      url = file.is_a?(Hash) ? file["url"] : nil
      next false if url.blank?
      asset_urls[filename] = absolutize_asset_url(url)
      true
    end
  end

  def self.absolutize_asset_url(url)
    url.match?(%r{\Ahttps?://}) ? url : get_dashboard_url_prefix + url
  end
end
