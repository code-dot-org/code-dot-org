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
#  properties            :text(16777215)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

class CurriculumReference < Level
  serialized_attrs %w(
    reference
  )

  validates :reference, format: {
    with: /\A\/(docs|curriculum)\//,
    message: "Must begin with /docs or /curriculum",
    allow_blank: true
  }

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.curriculum_reference,
        level_num: 'custom',
      )
    )
  end

  # Get the URL of the studio.code.org/(docs|curriculum) routes (that serves as
  # a proxy to our (docs|curriculum).code.org route)
  def href
    return nil unless properties['reference']
    properties['reference']
  end

  def concept_level?
    true
  end
end
