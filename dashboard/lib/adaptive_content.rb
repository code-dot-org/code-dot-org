# Reads adaptive content from dashboard/config/level_content/adaptive/<id>.json.
#
# Files are parsed once per process and re-read when their mtime changes,
# so a deploy (or a local edit) is picked up without a restart. The parsed
# hash is shared across requests: callers must not mutate it. Concurrent
# misses may parse the same file twice; that is harmless, so no lock.
module AdaptiveContent
  ID_PATTERN = /\A[a-z0-9][a-z0-9_-]{0,63}\z/

  @cache = {}

  def self.content_dir
    Rails.root.join('config', 'level_content', 'adaptive')
  end

  def self.valid_id?(id)
    id.is_a?(String) && id.match?(ID_PATTERN)
  end

  def self.path(id)
    raise ArgumentError, "invalid adaptive id: #{id.inspect}" unless valid_id?(id)
    content_dir.join("#{id}.json")
  end

  def self.exist?(id)
    valid_id?(id) && File.file?(path(id))
  end

  def self.ids
    Dir.glob(content_dir.join('*.json')).
      map {|file| File.basename(file, '.json')}.
      select {|id| valid_id?(id)}.
      sort
  end

  # Returns the parsed content, or nil when no file exists for the id.
  def self.load(id)
    return nil unless exist?(id)
    file = path(id)
    mtime = File.mtime(file)
    cached_mtime, cached = @cache[id]
    return cached if cached && cached_mtime == mtime
    parsed = JSON.parse(File.read(file))
    @cache[id] = [mtime, parsed]
    parsed
  end

  def self.reset_cache!
    @cache.clear
  end
end
