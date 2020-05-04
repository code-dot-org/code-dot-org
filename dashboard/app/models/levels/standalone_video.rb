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
#  ideal_level_source_id :integer          unsigned
#  user_id               :integer
#  properties            :text(65535)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#  contained_level_id    :integer
#  template_level_id     :integer
#
# Indexes
#
#  index_levels_on_contained_level_id  (contained_level_id)
#  index_levels_on_game_id             (game_id)
#  index_levels_on_name                (name)
#  index_levels_on_template_level_id   (template_level_id)
#

class StandaloneVideo < Level
  serialized_attrs %w(
    skip_dialog
    skip_sound
    video_rounded_corners
    video_full_width
  )

  before_validation do
    self.skip_dialog = true
    self.skip_sound = true
  end

  validate :has_video_key?

  def has_video_key?
    unless video_key.present?
      errors.add :video_key, :blank
    end
  end

  def icon
    'fa-video-camera'
  end

  def concept_level?
    true
  end

  def enable_scrolling?
    # ensures we have the small footer when in "full width" mode
    video_full_width
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(user: params[:user], game: Game.standalone_video, level_num: 'custom'))
  end
end
