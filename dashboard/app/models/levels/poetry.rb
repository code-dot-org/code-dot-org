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
#  properties            :text(16777215)
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
#

class Poetry < GamelabJr
  serialized_attrs %w(
    show_poem_dropdown
    default_poem
  )

  def self.skins
    ['gamelab']
  end

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.poetry,
        level_num: 'custom',
        properties: {
          block_pools: [
            "GamelabJr",
            "Poetry"
          ],
          helper_libraries: [
            "NativeSpriteLab",
          ],
          use_default_sprites: true,
          hide_animation_mode: true,
          show_type_hints: true,
          use_modal_function_editor: true,
        }
      )
    )
  end

  def common_blocks(type)
  end

  # Used by levelbuilders to set a default poem on a Poetry level.
  def self.hoc_poems
    [
      ['', ''],
      ['My Brilliant Image', 'hafez'],
      ['Twinkle, Twinkle Little Star', 'carroll_1'],
      ['Crocodile', 'carroll_2'],
      ['Jabberwocky', 'carroll_3'],
      ['Sing', 'rumi_1'],
      ['Ocean', 'rumi_2'],
      ['Wynken, Blynken, and Nod', 'field'],
      ['Warm Summer Sun', 'twain'],
      ['I Wandered Lonely as a Cloud', 'wordsworth'],
      ['Harlem', 'hughes'],
      ['Don\'t Go Into the Library', 'rios'],
      ['Dream Variations', 'hughes_1'],
      ['In the Garden', 'hopler'],
      ['Return', 'lomeli'],
      ['Toasting Marshmallows', 'singer']
    ]
  end
end
