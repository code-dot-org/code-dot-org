# Reads config/us_only_ai_curriculum.yml, the snapshot of units whose Aichat
# levels use a model that is only available in the US. See that file for why
# the list is a snapshot rather than a query.
class UsOnlyAiCurriculum
  CONFIG_PATH = 'config/us_only_ai_curriculum.yml'.freeze

  # Unit names in the snapshot.
  def self.unit_names
    @unit_names ||= Set.new(YAML.load_file(Rails.root.join(CONFIG_PATH)).fetch('units'))
  end

  def self.include?(unit_name)
    unit_names.include?(unit_name)
  end

  # Recomputes the list from the levels themselves. Only the rake task and its
  # test call this; it is the slow path the snapshot exists to avoid.
  def self.compute_unit_names
    Unit.joins(:levels).merge(Level.with_us_only_aichat_model).distinct.pluck(:name).sort
  end

  def self.reset_cache!
    @unit_names = nil
  end
end
