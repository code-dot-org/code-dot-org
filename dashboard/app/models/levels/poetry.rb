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
#

class Poetry < GamelabJr
  before_save :check_default_poem
  before_save :check_dropdown_poems
  validate :check_default_poem_in_dropdown

  serialized_attrs %w(
    default_poem
    standalone_app_name
    dropdown_poems
  )

  def check_default_poem
    self.default_poem = nil unless Poetry.subtypes_with_poems.include?(standalone_app_name)
  end

  def check_dropdown_poems
    self.dropdown_poems = nil unless Poetry.subtypes_with_poems.include?(standalone_app_name)
  end

  def check_default_poem_in_dropdown
    if default_poem.present? && Poetry.subtypes_with_poems.include?(standalone_app_name) &&
      dropdown_poems && !dropdown_poems.empty? && !dropdown_poems.include?(default_poem)
      errors.add(:default_poem, "is not in dropdown poem list")
    end
  end

  # Poetry levels use the same shared_functions as GamelabJr
  def shared_function_type
    GamelabJr
  end

  def self.standalone_app_names
    [['Poetry', 'poetry'], ['Poetry HOC', 'poetry_hoc'],  ['Time Capsule', 'time_capsule']]
  end

  def self.subtypes_with_poems
    %w(poetry_hoc time_capsule)
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
          use_modal_function_editor: false,
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

  def available_poems
    return dropdown_poems unless dropdown_poems
    return Poetry.poems_for_subtype(standalone_app_name)
  end

  # Used to get all available poems for a Poetry level.
  def self.poems_for_subtype(subtype)
    case subtype
    when 'poetry_hoc'
      hoc_poems
    when 'time_capsule'
      time_capsule_poems
    else
      []
    end
  end

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

  def self.time_capsule_poems
    [
      ['', ''],
      ['1990 - My Poem 1', 'pat'],
      ['2020 - My Poem 2', 'erin'],
      ['2021 - My Poem 3', 'aryanna'],
      ['2023 - My Poem 4', 'tj'],
      ['1905 - The Turn of the Century ', 'erik'],
      ['1963 - March on Washington', 'aaron'],
      ['1969 - Inspiring Dreams', 'noemi'],
      ['1969 - Hope for Peace', 'ken'],
      ['1980 - Bring Us Together', 'mike'],
      ['1990 - Mary W. Jackson ', 'jess'],
    ]
  end
end
