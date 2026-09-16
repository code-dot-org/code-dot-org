# Reads Adaptive pathway and skill content from dashboard/config/level_content/adaptive.
# The format is defined in apps/src/adaptive/schema. Parsed files are cached and
# shared across requests; callers must not mutate them.
module AdaptiveContent
  ID_PATTERN = /\A[a-z0-9][a-z0-9_-]{0,63}\z/

  # File path => [mtime, parsed JSON].
  @cache = {}

  def self.content_dir
    Rails.root.join('config', 'level_content', 'adaptive')
  end

  def self.skills_dir
    content_dir.join('skills')
  end

  def self.valid_id?(id)
    id.is_a?(String) && id.match?(ID_PATTERN)
  end

  def self.path(id)
    raise ArgumentError, "invalid adaptive content id: #{id.inspect}" unless valid_id?(id)
    content_dir.join("#{id}.json")
  end

  def self.skill_path(id)
    raise ArgumentError, "invalid adaptive skill id: #{id.inspect}" unless valid_id?(id)
    skills_dir.join("#{id}.json")
  end

  def self.exist?(id)
    valid_id?(id) && File.file?(path(id))
  end

  def self.skill_exist?(id)
    valid_id?(id) && File.file?(skill_path(id))
  end

  def self.ids
    ids_in(content_dir)
  end

  def self.skill_ids
    ids_in(skills_dir)
  end

  # Skill IDs referenced by the pathway's skill tree steps, in first-seen order.
  def self.referenced_skill_ids(level)
    steps = level.is_a?(Hash) && level['steps'].is_a?(Array) ? level['steps'] : []
    steps.
      select {|step| step.is_a?(Hash) && step['kind'] == 'skillTree' && step['skills'].is_a?(Array)}.
      flat_map {|step| step['skills'].filter_map {|ref| ref['skillId'] if ref.is_a?(Hash)}}.
      uniq
  end

  # The served pathway for `id`: the source file with referenced skills inlined
  # under `skills` and each skill's standards resolved. Nil when no pathway file
  # exists. Skills with no file are omitted; unresolvable standards pass through.
  def self.load(id)
    return nil unless exist?(id)
    level = read(path(id))
    skills = referenced_skill_ids(level).filter_map do |skill_id|
      next unless skill_exist?(skill_id)
      [skill_id, with_resolved_standards(read(skill_path(skill_id)))]
    end
    level.merge('skills' => skills.to_h)
  end

  def self.reset_cache!
    @cache.clear
  end

  private_class_method def self.ids_in(dir)
    Dir.glob(dir.join('*.json')).
      map {|file| File.basename(file, '.json')}.
      select {|id| valid_id?(id)}.
      sort
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
