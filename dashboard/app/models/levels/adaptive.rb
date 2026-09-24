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

  def summarize_for_lab2_properties(script, script_level = nil, current_user = nil, unit_group_unit: nil)
    properties = super
    properties[:pathway] = content
    properties
  end

  # Only the file's existence is checked; the content is validated in CI.
  private def adaptive_content_exists
    return if adaptive_id.blank?
    return if AdaptiveContent.exist?(adaptive_id)
    errors.add(:adaptive_id, "has no content file under #{AdaptiveContent.content_dir}")
  end
end
