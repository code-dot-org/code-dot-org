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
#  notes                 :text(16777215)
#  audit_log             :text(16777215)
#
# Indexes
#
#  index_levels_on_game_id    (game_id)
#  index_levels_on_level_num  (level_num)
#  index_levels_on_name       (name)
#

class Poetry < GamelabJr
  before_save :check_default_poem

  serialized_attrs %w(
    default_poem
    standalone_app_name
  )

  def check_default_poem
    self.default_poem = nil unless standalone_app_name == 'poetry_hoc'
  end

  # Poetry levels use the same shared_functions as GamelabJr
  def shared_function_type
    GamelabJr
  end

  def self.standalone_app_names
    [['Poetry', 'poetry'], ['Poetry HOC', 'poetry_hoc']]
  end

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
          standalone_app_name: 'poetry'
        }
      )
    )
  end

  def uses_google_blockly?
    true
  end

  def common_blocks(type)
  end

  # Used by levelbuilders to set a default poem on a Poetry level.
  def self.hoc_poems
    [
      ['', ''],
      ['My Brilliant Image', 'hafez'],
      ['The Star', 'taylor'],
      ['Crocodile', 'carroll2'],
      ['Jabberwocky', 'carroll3'],
      ['Sing', 'rumi1'],
      ['Ocean', 'rumi2'],
      ['Wynken, Blynken, and Nod', 'field'],
      ['Warm Summer Sun', 'twain'],
      ['I Wandered Lonely as a Cloud', 'wordsworth'],
      ['Harlem', 'hughes'],
      ['Don\'t Go Into the Library', 'rios'],
      ['Dream Variations', 'hughes1'],
      ['In the Garden', 'hopler'],
      ['Toasting Marshmallows', 'singer'],
      ['Affirmation', 'ewing'],
      ['Dream Destroyed', 'alexander'],
      ['Remember', 'harjo'],
      ['Mountain', 'po'],
      ['Rejoice', 'tzu'],
      ['An Afternoon Nap', 'lomeli1'],
      ['An Ode to Imagery', 'lomeli2'],
      ['Nothing Gold Can Stay', 'frost']
    ]
  end
end
