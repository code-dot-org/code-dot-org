# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :bigint           unsigned
#  user_id               :integer
#  properties            :text(4294967295)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#  index_levels_on_type       (type)
#
# Curriculum entry point for one adaptive pathway. Holds only the pathway's ID;
# the content is a JSON file under dashboard/config/level_content/adaptive.
class Adaptive < Level
  serialized_attrs %w(
    adaptive_id
  )

  PROJECT_STEP_ID = 'project'.freeze

  validates :adaptive_id, presence: true
  validate :adaptive_content_exists

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.adaptive,
        level_num: 'custom',
      )
    )
  end

  def uses_lab2?
    true
  end

  def enable_scrolling?
    true
  end

  # The served pathway for this level, or nil when its file is missing.
  def content
    AdaptiveContent.load(adaptive_id)
  end

  # The step with `step_id`, or nil; `project` finds the project screen's step.
  def find_step(step_id)
    pathway = content
    return nil unless pathway
    step = steps(pathway).find {|s| s['id'] == step_id}
    return step if step
    return nil unless step_id == PROJECT_STEP_ID
    {'id' => PROJECT_STEP_ID, 'kind' => 'level', 'level' => pathway.dig('project', 'templateLevel')}
  end

  # Level step id => Level, leaving out steps whose level does not exist.
  def step_levels
    pathway = content
    return {} unless pathway
    steps = level_steps(pathway)
    levels = Level.where(name: steps.map {|step| step['level']}.uniq).index_by(&:name)
    steps.filter_map {|step| [step['id'], levels[step['level']]] if levels[step['level']]}.to_h
  end

  def step_level?(level)
    step_levels.values.any? {|step_level| step_level.id == level.id}
  end

  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil, unit_group_unit: nil)
    properties = super
    pathway = content
    properties[:pathway] = pathway && with_level_properties(pathway) do |level|
      level.summarize_for_lab2_properties(script, nil, current_user)
    end
    properties
  end

  # Only the file's existence is checked; the content is validated in CI.
  private def adaptive_content_exists
    return if adaptive_id.blank?
    return if AdaptiveContent.exist?(adaptive_id)
    errors.add(:adaptive_id, "has no content file under #{AdaptiveContent.content_dir}")
  end

  # A copy of `pathway` with each referenced level's properties (inlined under
  # `levelProperties`) and each referenced video's URLs (inlined as `src`,
  # `download`, `thumbnail`) resolved. The cached pathway is not touched.
  # Unknown level names pass through unresolved so the client can report them.
  private def with_level_properties(pathway)
    names = [pathway.dig('project', 'templateLevel'), *level_steps(pathway).map {|step| step['level']}]
    levels = Level.where(name: names.compact.uniq).index_by(&:name)

    video_keys = video_steps(pathway).filter_map {|step| step['videoKey']}.uniq
    videos = Video.where(key: video_keys).index_by(&:key)

    resolved = pathway.dup
    if pathway['project'].is_a?(Hash)
      level = levels[pathway.dig('project', 'templateLevel')]
      resolved['project'] = level ? pathway['project'].merge('levelProperties' => yield(level)) : pathway['project']
    end
    if pathway['checkpoints'].is_a?(Array)
      resolved['checkpoints'] = pathway['checkpoints'].map do |checkpoint|
        next checkpoint unless checkpoint.is_a?(Hash) && checkpoint['steps'].is_a?(Array)
        checkpoint.merge(
          'steps' => checkpoint['steps'].map do |step|
            if level_step?(step)
              level = levels[step['level']]
              level ? step.merge('levelProperties' => yield(level)) : step
            elsif video_step?(step)
              video = videos[step['videoKey']]
              next step unless video
              step.merge(
                'src' => video.youtube_url,
                'download' => video.download,
                'thumbnail' => video.thumbnail_url
              )
            else
              step
            end
          end
        )
      end
    end
    resolved
  end

  private def steps(pathway)
    checkpoints = pathway['checkpoints']
    return [] unless checkpoints.is_a?(Array)
    checkpoints.flat_map do |checkpoint|
      steps = checkpoint.is_a?(Hash) ? checkpoint['steps'] : nil
      steps.is_a?(Array) ? steps.select {|step| step.is_a?(Hash)} : []
    end
  end

  private def level_steps(pathway)
    steps(pathway).select {|step| level_step?(step)}
  end

  private def video_steps(pathway)
    steps(pathway).select {|step| video_step?(step)}
  end

  private def level_step?(step)
    step.is_a?(Hash) && step['kind'] == 'level' && step['level'].is_a?(String)
  end

  private def video_step?(step)
    step.is_a?(Hash) && step['kind'] == 'video' && step['videoKey'].is_a?(String)
  end
end
