# Reads and writes the AI Lab datasets that levelbuilders save. The files are in
# dashboard/config/level_content/ailab_datasets: a CSV and a metadata JSON for
# each dataset, and manifest.json with the list. A stored dataset replaces the
# dataset with the same ID in the AI Lab bundle (apps/src/ailab/engine).
# Parsed files are cached; callers must not mutate them.
module AilabDatasets
  ID_PATTERN = /\A[A-Za-z0-9_-]+\z/

  # The apps build serves the files of the bundled datasets from this URL.
  BUNDLED_FILES_URL = '/blockly/media/skins/ailab/'.freeze

  # File path => [mtime, parsed JSON].
  @cache = {}

  def self.content_dir
    Rails.root.join('config', 'level_content', 'ailab_datasets')
  end

  def self.bundled_manifest_file
    apps_dir('src', 'ailab', 'engine', 'datasets-manifest.json')
  end

  def self.valid_id?(id)
    id.is_a?(String) && id.match?(ID_PATTERN)
  end

  def self.csv_file(id)
    file(id, 'csv')
  end

  def self.metadata_file(id)
    file(id, 'json')
  end

  # The manifest entries of all datasets. `path`, `metadataPath` and `imagePath` are URLs.
  def self.all
    stored = stored_entries
    stored_ids = stored.map {|entry| entry['id']}
    bundled_entries.reject {|entry| stored_ids.include?(entry['id'])} + stored
  end

  def self.ids
    all.map {|entry| entry['id']}
  end

  # The manifest entry of a dataset that a levelbuilder saved. Nil for a bundled or unknown ID.
  def self.stored(id)
    entry = manifest_entries.find {|existing| existing['id'] == id}
    entry && with_file_urls(entry)
  end

  def self.stored_entries
    manifest_entries.map {|entry| with_file_urls(entry)}
  end

  def self.save(id:, name:, is_toy:, row_count:, csv:, metadata:)
    with_lock do
      File.atomic_write(csv_file(id)) {|temp| temp.write(csv)}
      File.atomic_write(metadata_file(id)) {|temp| temp.write("#{JSON.pretty_generate(metadata)}\n")}

      entries = fresh_manifest_entries
      # The bundled manifest has no isToy key for the datasets that the dataset picker shows.
      entry = {'id' => id, 'name' => name, 'isToy' => is_toy || nil, 'rowCount' => row_count}.compact
      write_manifest(entries.reject {|existing| existing['id'] == id} + [entry])
    end
  end

  def self.reset_cache!
    @cache.clear
  end

  private_class_method def self.file(id, extension)
    raise ArgumentError, "invalid AI Lab dataset id: #{id.inspect}" unless valid_id?(id)
    content_dir.join("#{id}.#{extension}")
  end

  private_class_method def self.manifest_file
    content_dir.join('manifest.json')
  end

  # The lock stops two writes at the same time from losing a manifest entry.
  private_class_method def self.with_lock
    FileUtils.mkdir_p(content_dir)
    File.open(content_dir) do |dir|
      dir.flock(File::LOCK_EX)
      yield
    end
  end

  # Two writes can have the same file time, so the cache can be out of date here.
  private_class_method def self.fresh_manifest_entries
    @cache.delete(manifest_file.to_s)
    manifest_entries
  end

  private_class_method def self.write_manifest(entries)
    manifest = {'datasets' => entries.sort_by {|entry| entry['id']}}
    File.atomic_write(manifest_file) {|temp| temp.write("#{JSON.pretty_generate(manifest)}\n")}
    @cache.delete(manifest_file.to_s)
  end

  # No manifest file means that no levelbuilder has saved a dataset.
  private_class_method def self.manifest_entries
    File.file?(manifest_file) ? read_json(manifest_file)['datasets'] : []
  end

  private_class_method def self.with_file_urls(entry)
    id = entry['id']
    entry.merge(
      'path' => file_url(id, 'csv', csv_file(id)),
      'metadataPath' => file_url(id, 'metadata', metadata_file(id))
    )
  end

  # The file time in the URL makes a browser get a replaced file again.
  private_class_method def self.file_url(id, action, file)
    "/ailab_datasets/#{id}/#{action}?v=#{File.mtime(file).to_i}"
  end

  private_class_method def self.bundled_entries
    read_json(bundled_manifest_file)['datasets'].map do |entry|
      paths = entry.slice('path', 'metadataPath', 'imagePath')
      entry.merge(paths.transform_values {|path| BUNDLED_FILES_URL + path})
    end
  end

  private_class_method def self.read_json(file)
    mtime = File.mtime(file)
    cached_mtime, cached = @cache[file.to_s]
    return cached if cached && cached_mtime == mtime
    parsed = JSON.parse(File.read(file))
    @cache[file.to_s] = [mtime, parsed]
    parsed
  end
end
