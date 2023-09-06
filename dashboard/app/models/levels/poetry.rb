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
  validate :validate_default_poem_and_available_poems

  serialized_attrs %w(
    default_poem
    standalone_app_name
    available_poems
  )
  # Note that standalone_app_name refers to the Poetry subtype.

  # Set the default poem to nil if the standalone_app does not have poems, or if the default poem is
  # not in the list of poems for the standalone_app.
  def sanitize_default_poem
    self.default_poem = nil if Poetry.standalone_apps_with_poems.exclude?(standalone_app_name) ||
                               Poetry.poem_keys_for_standalone_app(standalone_app_name).exclude?(default_poem)
  end

  # Set the available poems to nil if the standalone_app does not have poems.
  # Also remove any available poems that are not in the list of poems for the standalone_app.
  def sanitize_available_poems
    self.available_poems = nil unless Poetry.standalone_apps_with_poems.include?(standalone_app_name)
    return if Poetry.standalone_apps_with_poems.exclude?(standalone_app_name) || (available_poems && available_poems.empty?)
    # filter out any invalid poems from available_poems
    self.available_poems = available_poems & Poetry.poem_keys_for_standalone_app(standalone_app_name)
  end

  def validate_default_poem_and_available_poems
    sanitize_default_poem
    sanitize_available_poems
    # If there is a default poem and dropdown poem(s), check that the default poem is
    # in the dropdown poem list.
    if default_poem.present? && Poetry.standalone_apps_with_poems.include?(standalone_app_name) &&
       available_poems && !available_poems.empty? && available_poems.exclude?(default_poem)
      errors.add(:default_poem, "selected default poem is not in dropdown poem list")
    end
  end

  # Poetry levels use the same shared_functions as GamelabJr
  def shared_function_type
    GamelabJr
  end

  def project_type
    standalone_app_name
  end

  def self.standalone_app_names
    [['Poetry', 'poetry'], ['Poetry HOC', 'poetry_hoc'],  ['Time Capsule', 'time_capsule']]
  end

  def self.standalone_apps_with_poems
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

  # Used to get all available poems for a Poetry level.
  def self.poems_for_standalone_app(standalone_app_name)
    case standalone_app_name
    when 'poetry_hoc'
      hoc_poems
    when 'time_capsule'
      time_capsule_poems
    else
      []
    end
  end

  def self.poem_keys_for_standalone_app(standalone_app_name)
    # get the keys out of a poem list. Assumes each entry
    # in the list is a 2 element array
    poems_for_standalone_app(standalone_app_name).map {|poem| poem[1]}
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
