# == Schema Information
#
# Table name: games
#
#  id             :integer          not null, primary key
#  name           :string(255)
#  created_at     :datetime
#  updated_at     :datetime
#  app            :string(255)
#  intro_video_id :integer
#
# Indexes
#
#  index_games_on_intro_video_id  (intro_video_id)
#

# An ordered set of levels associated with a single app, e.g. Farmer2
# also associates an intro video

# Game.name also maps to localized strings, e.g. [data.en.yml]: game: name: 'Unplug1': 'Introduction to Computer Science'
class Game < ApplicationRecord
  include Seeded
  has_many :levels
  belongs_to :intro_video, class_name: 'Video', optional: true

  def self.by_name(name)
    (@@game_cache ||= Game.all.index_by(&:name))[name].try(:id)
  end
  mattr_accessor :game_cache # Direct access should only be used in tests

  def self.custom_maze
    @@game_custom_maze ||= find_by_name("CustomMaze")
  end

  UNPLUG = 'unplug'.freeze
  MULTI = 'multi'.freeze
  MATCH = 'match'.freeze
  ARTIST = TURTLE = 'turtle'.freeze # heh
  FLAPPY = 'flappy'.freeze
  BOUNCE = 'bounce'.freeze
  PLAYLAB = STUDIO = 'studio'.freeze
  STUDIO_EC = 'StudioEC'.freeze
  APPLAB = WEBAPP = 'applab'.freeze
  GAMELAB = 'gamelab'.freeze
  WEBLAB = 'weblab'.freeze
  NETSIM = 'netsim'.freeze
  CRAFT = 'craft'.freeze
  MAZE = 'maze'.freeze
  CALC = 'calc'.freeze
  EVAL = 'eval'.freeze
  PIXELATION = 'pixelation'.freeze
  TEXT_COMPRESSION = 'text_compression'.freeze
  LEVEL_GROUP = 'level_group'.freeze
  PUBLIC_KEY_CRYPTOGRAPHY = 'public_key_cryptography'.freeze
  DANCE = 'dance'.freeze
  SPRITELAB = 'spritelab'.freeze
  FISH = 'fish'.freeze
  AILAB = 'ailab'.freeze
  JAVALAB = 'javalab'.freeze
  POETRY = 'poetry'.freeze
  MUSIC = 'music'.freeze
  AICHAT = 'aichat'.freeze
  PYTHONLAB = 'pythonlab'.freeze
  PANELS = 'panels'.freeze
  WEBLAB2 = 'weblab2'.freeze

  def self.bounce
    @@game_bounce ||= find_by_name("Bounce")
  end

  def self.unplugged
    @@game_unplugged ||= find_by_name("Unplugged")
  end

  def self.custom_studio
    @@game_custom_studio ||= find_by_name("CustomStudio")
  end

  def self.studio_ec
    @@game_studio_ec ||= find_by_name("StudioEC")
  end

  def self.custom_artist
    @@game_custom_artist ||= find_by_name("Custom")
  end

  def self.custom_flappy
    @@game_custom_flappy ||= find_by_name("CustomFlappy")
  end

  def self.calc
    @@game_calc ||= find_by_name("Calc")
  end

  def self.eval
    @@game_eval ||= find_by_name("Eval")
  end

  def self.applab
    @@game_applab ||= find_by_name("Applab")
  end

  def self.gamelab
    @@game_gamelab ||= find_by_name("Gamelab")
  end

  def self.weblab
    @@game_weblab ||= find_by_name("Weblab")
  end

  def self.netsim
    @@game_netsim ||= find_by_name("NetSim")
  end

  def self.craft
    @@game_craft ||= find_by_name("Craft")
  end

  def self.pixelation
    @@game_pixelation ||= find_by_name("Pixelation")
  end

  def self.text_compression
    @@game_text_compression ||= find_by_name("TextCompression")
  end

  def self.odometer
    @@game_odometer ||= find_by_name("Odometer")
  end

  def self.vigenere
    @@game_vigenere ||= find_by_name("Vigenere")
  end

  def self.frequency_analysis
    @@game_frequency_analysis ||= find_by_name("FrequencyAnalysis")
  end

  def self.public_key_cryptography
    @@game_public_key_cryptography ||= find_by_name("PublicKeyCryptography")
  end

  def self.multi
    @@game_multi ||= find_by_name("Multi")
  end

  def self.free_response
    @@game_free_response ||= find_by_name("FreeResponse")
  end

  def self.standalone_video
    @@game_standalone_video ||= find_by_name("StandaloneVideo")
  end

  def self.external_link
    @@game_external_link ||= find_by_name('ExternalLink')
  end

  def self.curriculum_reference
    @@game_curriculum_reference ||= find_by_name('CurriculumReference')
  end

  def self.dance
    @@game_dance ||= find_by_name('Dance')
  end

  def self.spritelab
    @@game_spritelab ||= find_by_name('Spritelab')
  end

  def self.fish
    @@game_fish ||= find_by_name('Fish')
  end

  def self.ailab
    @@game_ailab ||= find_by_name('Ailab')
  end

  def self.javalab
    @@game_javalab ||= find_by_name('Javalab')
  end

  def self.poetry
    @@game_poetry ||= find_by_name('Poetry')
  end

  def self.music
    @@game_music ||= find_by_name('Music')
  end

  def self.aichat
    @@game_aichat ||= find_by_name('Aichat')
  end

  def self.pythonlab
    @@game_pythonlab ||= find_by_name('Pythonlab')
  end

  def self.panels
    @@game_panels ||= find_by_name('Panels')
  end

  def self.weblab2
    @@game_weblab2 ||= find_by_name("Weblab2")
  end

  def unplugged?
    app == UNPLUG
  end

  def multi?
    app == MULTI
  end

  def match?
    app == MATCH
  end

  def level_group?
    app == LEVEL_GROUP
  end

  def supports_sharing?
    [
      TURTLE,
      FLAPPY,
      BOUNCE,
      STUDIO,
      STUDIO_EC,
      APPLAB,
      CRAFT,
      GAMELAB,
      WEBLAB,
      DANCE,
      SPRITELAB,
      POETRY,
      MUSIC
    ].include? app
  end

  def sharing_filtered?
    app == STUDIO
  end

  def flappy?
    app == FLAPPY
  end

  def uses_pusher?
    app == NETSIM
  end

  def uses_small_footer?
    [NETSIM, APPLAB, TEXT_COMPRESSION, GAMELAB, WEBLAB, DANCE, FISH, AILAB, JAVALAB, AICHAT, PYTHONLAB, WEBLAB2].include? app
  end

  def no_footer?
    false
  end

  # True if the app takes responsibility for showing footer info
  def owns_footer_for_share?
    [APPLAB, WEBLAB].include? app
  end

  def has_i18n?
    !([NETSIM].include? app)
  end

  def use_azure_speech_service?
    [APPLAB, GAMELAB, SPRITELAB].include? app
  end

  def channel_backed?
    [APPLAB, GAMELAB, WEBLAB, PIXELATION, SPRITELAB, JAVALAB, POETRY, MUSIC, PYTHONLAB, WEBLAB2, AICHAT].include? app
  end

  def use_restricted_songs?
    return false unless [DANCE, MUSIC].include? app
    return true if CDO.aws_s3_emulated
    dev_with_credentials = rack_env?(:development) && !!CDO.cloudfront_key_pair_id
    CDO.cdn_enabled || dev_with_credentials || (rack_env?(:test) && ENV.fetch('CI', nil))
  end

  # Format: id:name:app:intro_video
  # Don't change existing IDs! Always append new games to the end.
  GAMES_BY_INDEX = %w(
    1:Maze:maze:maze_intro
    2:Artist:turtle:artist_intro
    3:Artist2:turtle
    4:Farmer:maze:farmer_intro
    5:Artist3:turtle
    6:Farmer2:maze
    7:Artist4:turtle
    8:Farmer3:maze
    9:Artist5:turtle
    10:MazeEC:maze:maze_intro
    11:Unplug1:unplug
    12:Unplug2:unplug
    13:Unplug3:unplug
    14:Unplug4:unplug
    15:Unplug5:unplug
    16:Unplug6:unplug
    17:Unplug7:unplug
    18:Unplug8:unplug
    19:Unplug9:unplug
    20:Unplug10:unplug
    21:Unplug11:unplug
    22:Bounce:bounce
    23:Custom:turtle
    24:Flappy:flappy:flappy_intro
    25:CustomMaze:maze
    26:Studio:studio
    27:Jigsaw:jigsaw
    28:MazeStep:maze
    29:Multi:multi
    30:Match:match
    31:Unplugged:unplug
    32:Wordsearch:wordsearch
    33:CustomStudio:studio
    34:Calc:calc
    35:Webapp:webapp
    36:Eval:eval
    37:ArtistEC:turtle:artist_intro
    38:TextMatch
    39:StudioEC:studio
    40:ContractMatch
    41:Applab:applab
    42:NetSim:netsim
    43:External:external
    44:Pixelation:pixelation
    45:TextCompression:text_compression
    46:Odometer:odometer
    47:FrequencyAnalysis:frequency_analysis
    48:Vigenere:vigenere
    49:Craft:craft
    50:Gamelab:gamelab
    51:LevelGroup:level_group
    52:FreeResponse:free_response
    53:NotUsed:not_used
    54:StandaloneVideo:standalone_video
    55:ExternalLink:external_link
    56:EvaluationMulti:evaluation_multi
    57:PublicKeyCryptography:public_key_cryptography
    58:Weblab:weblab
    59:CurriculumReference:curriculum_reference
    60:Map:map
    61:CustomFlappy:flappy
    62:Scratch:scratch
    63:Dance:dance
    64:Spritelab:spritelab
    65:BubbleChoice:bubble_choice
    66:Fish:fish
    67:Ailab:ailab
    68:Javalab:javalab
    69:Poetry:poetry
    70:Music:music
    71:Aichat:aichat
    72:Pythonlab:pythonlab
    73:Panels:panels
    74:Weblab2:weblab2
  )

  def self.setup
    videos_by_key = Video.where(locale: 'en-US').index_by(&:key)

    games = GAMES_BY_INDEX.map do |line|
      id, name, app, intro_video_key = line.split ':'
      {
        id: id.to_i,
        name: name,
        app: app,
        intro_video_id: videos_by_key[intro_video_key]&.id
      }
    end

    existing_ids = Game.pluck(:id).to_set
    new_ids = games.to_set {|g| g[:id]}

    # Insert or update records
    Game.upsert_all(games, unique_by: :id)

    # Remove games that are no longer in GAMES_BY_INDEX
    to_delete = existing_ids - new_ids
    Game.where(id: to_delete).delete_all if to_delete.any?
  end
end
