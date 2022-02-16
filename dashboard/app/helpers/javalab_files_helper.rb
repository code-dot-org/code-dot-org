
module JavalabFilesHelper
  def self.get_project_files(channel_id)
    storage_id, storage_app_id = storage_decrypt_channel_id(channel_id)
    all_files = {}
    # get sources file
    source_data = SourceBucket.new.get(channel_id, "main.json")
    # can call .string on this value to get raw string. Keeping as StringIO for now
    # since we don't know how we'll use this data
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
    # get maze file
    return all_files
  end
end
