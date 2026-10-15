# Reads Adaptive pathway content from dashboard/config/level_content/adaptive.
# The format is defined in apps/src/adaptive/schema. Parsed files are cached and
# shared across requests; callers must not mutate them.
module AdaptiveContent
  ID_PATTERN = /\A[a-z0-9][a-z0-9_-]{0,63}\z/

  # File path => [mtime, parsed JSON].
  @cache = {}

  def self.content_dir
    Rails.root.join('config', 'level_content', 'adaptive')
  end

  def self.valid_id?(id)
    id.is_a?(String) && id.match?(ID_PATTERN)
  end

  def self.path(id)
    raise ArgumentError, "invalid adaptive content id: #{id.inspect}" unless valid_id?(id)
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

  # The served pathway for `id`: the source file with each skill's standards
  # resolved. Nil when no pathway file exists. Unresolvable standards pass through.
  def self.load(id)
    return nil unless exist?(id)
    pathway = read(path(id))
    skills = pathway['skills']
    return pathway unless skills.is_a?(Hash)
    pathway.merge('skills' => skills.transform_values {|skill| with_resolved_standards(skill)})
  end

  def self.reset_cache!
    @cache.clear
  end

  private_class_method def self.refs_in(object)
    refs = object.is_a?(Hash) ? object['standards'] : nil
    return [] unless refs.is_a?(Array)
    refs.select {|ref| ref.is_a?(Hash) && ref['framework'].is_a?(String) && ref['shortcode'].is_a?(String)}
  end

  private_class_method def self.find_standard(ref)
    Standard.joins(:framework).find_by(frameworks: {shortcode: ref['framework']}, shortcode: ref['shortcode'])
  end

  # A copy of `object` with each standards reference expanded to the lesson
  # plan's summary shape, keeping `framework` and `shortcode`. Unresolvable
  # references are kept as written.
  private_class_method def self.with_resolved_standards(object)
    refs = refs_in(object)
    return object if refs.empty?
    resolved = refs.map do |ref|
      standard = find_standard(ref)
      next ref unless standard
      summary = standard.summarize_for_lesson_show.transform_keys(&:to_s).compact
      ref.merge(summary.except('shortcode'))
    end
    object.merge('standards' => resolved)
  end

  private_class_method def self.read(file)
    mtime = File.mtime(file)
    cached_mtime, cached = @cache[file.to_s]
    return cached if cached && cached_mtime == mtime
    parsed = JSON.parse(File.read(file))
    @cache[file.to_s] = [mtime, parsed]
    parsed
  end
end
