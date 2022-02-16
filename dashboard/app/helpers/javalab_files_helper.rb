
module JavalabFilesHelper
  # Get all files related to the project at the given channel id as a hash. The hash is in the format
  # below. All values are StringIO.
  # {
  #   "main.json": <main source file for a project>
  #   "assets": {"asset_name_1": <asset_value>, ...}
  #   "validation": <all validation code for a project, in json format>
  #   "maze": <serialized maze if it exists>
  # }
  # If the channel doesn't have validation and/or a maze, those fields will not be present.
  def self.get_project_files(channel_id)
    storage_id, storage_app_id = storage_decrypt_channel_id(channel_id)
    all_files = {}
    # get sources file
    source_data = SourceBucket.new.get(channel_id, "main.json")
    # Note: we can call .string on this value (and all other values for files) to get the raw string.
    all_files["main.json"] = source_data[:body]
    # get starter assets
    assets = {}
    asset_bucket = AssetBucket.new
    channel = ChannelToken.where(storage_app_id: storage_app_id, storage_id: storage_id).first
    level = Level.cache_find(channel.level_id)
    if level
      starter_asset_bucket = Aws::S3::Bucket.new(LevelStarterAssetsController::S3_BUCKET)
      (level&.project_template_level&.starter_assets || level.starter_assets || []).map do |friendly_name, uuid_name|
        filename = "#{LevelStarterAssetsController::S3_PREFIX}#{uuid_name}"
        asset = starter_asset_bucket.object(filename)
        assets[friendly_name] = asset.get.body
      end
    end
    # get level assets
    asset_list = asset_bucket.list(channel_id)
    asset_list.each do |asset|
      assets[asset[:filename]] = asset_bucket.get(channel_id, asset[:filename])[:body]
    end
    all_files["assets"] = assets
    # get validation code
    if level.respond_to?(:validation) && level.validation
      all_files["validation"] = StringIO.new(level.validation.to_json)
    end
    # get maze file
    serialized_maze = level.try(:get_serialized_maze)
    if serialized_maze
      all_files["maze"] = StringIO.new(serialized_maze.to_s)
    end
    return all_files
  end
end
