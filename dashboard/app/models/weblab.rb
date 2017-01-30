# == Schema Information
#
# Table name: levels
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)      not null
#  created_at               :datetime
#  updated_at               :datetime
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean          default(FALSE), not null
#  notes                    :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

class Weblab < Level
  before_save :fix_examples

  serialized_attrs %w(
    project_template_level_name
    start_sources
    teacher_markdown
    encrypted_examples
  )

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
      user: params[:user],
      game: Game.weblab,
      level_num: 'custom',
      properties: {
      }
    ))
  end

  def fix_examples
    # remove nil and empty strings from examples
    return if examples.nil?
    self.examples = examples.select(&:present?)
  end
end
