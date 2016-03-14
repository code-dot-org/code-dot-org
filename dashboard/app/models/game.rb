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
class Game < ActiveRecord::Base
  include Seeded
  has_many :levels
  belongs_to :intro_video, foreign_key: 'intro_video_id', class_name: 'Video'

  def self.by_name(name)
    (@@game_cache ||= Game.all.index_by(&:name))[name].try(:id)
  end

  def self.custom_maze
    @@game_custom_maze ||= find_by_name("CustomMaze")
  end

  UNPLUG = 'unplug'
  MULTI = 'multi'
  MATCH = 'match'
  ARTIST = TURTLE = 'turtle' # heh
  FLAPPY = 'flappy'
  BOUNCE = 'bounce'
  PLAYLAB = STUDIO = 'studio'
  STUDIO_EC = 'StudioEC'
  APPLAB = WEBAPP = 'applab'
  GAMELAB = 'gamelab'
  NETSIM = 'netsim'
  CRAFT = 'craft'
  MAZE = 'maze'
  CALC = 'calc'
  EVAL = 'eval'
  TEXT_COMPRESSION = 'text_compression'
  LEVEL_GROUP = 'level_group'

  def self.custom_studio
    @@game_custom_studio ||= find_by_name("CustomStudio")
  end

  def self.studio_ec
    @@game_custom_studio ||= find_by_name("StudioEC")
  end

  def self.custom_artist
    @@game_custom_artist ||= find_by_name("Custom")
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

  def self.multi
    @@game_multi ||= find_by_name("Multi")
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

  def supports_sharing?
    app == TURTLE || app == FLAPPY || app == BOUNCE || app == STUDIO || app == STUDIO_EC || app == APPLAB || app == CRAFT || app == GAMELAB
  end

  def flappy?
    app == FLAPPY
  end

  def uses_droplet?
    name == "MazeEC" || name == "ArtistEC" || name == "Applab" || name == "StudioEC" || name == "Gamelab"
  end

  def uses_pusher?
    app == NETSIM
  end

  def uses_small_footer?
    app == NETSIM || app == APPLAB || app == TEXT_COMPRESSION || app == GAMELAB
  end

  # True if the app takes responsibility for showing footer info
  def owns_footer_for_share?
    app === APPLAB
  end

  def has_i18n?
    !(app == NETSIM || app == APPLAB || app == GAMELAB)
  end

  def self.setup
    transaction do
      # Format: name:app:intro_video
      # Don't change the order of existing entries! Always append to the end of the list.
      reset_db
      %w(
        Maze:maze:maze_intro
        Artist:turtle:artist_intro
        Artist2:turtle
        Farmer:maze:farmer_intro
        Artist3:turtle
        Farmer2:maze
        Artist4:turtle
        Farmer3:maze
        Artist5:turtle
        MazeEC:maze:maze_intro
        Unplug1:unplug
        Unplug2:unplug
        Unplug3:unplug
        Unplug4:unplug
        Unplug5:unplug
        Unplug6:unplug
        Unplug7:unplug
        Unplug8:unplug
        Unplug9:unplug
        Unplug10:unplug
        Unplug11:unplug
        Bounce:bounce
        Custom:turtle
        Flappy:flappy:flappy_intro
        CustomMaze:maze
        Studio:studio
        Jigsaw:jigsaw
        MazeStep:maze
        Multi:multi
        Match:match
        Unplugged:unplug
        Wordsearch:wordsearch
        CustomStudio:studio
        Calc:calc
        Webapp:webapp
        Eval:eval
        ArtistEC:turtle:artist_intro
        TextMatch
        StudioEC:studio
        ContractMatch
        Applab:applab
        NetSim:netsim
        External:external
        Pixelation:pixelation
        TextCompression:text_compression
        Odometer:odometer
        FrequencyAnalysis:frequency_analysis
        Vigenere:vigenere
        Craft:craft
        Gamelab:gamelab
        LevelGroup:level_group
      ).each_with_index do |game, id|
        name, app, intro_video = game.split ':'
        Game.create!(id: id + 1, name: name, app: app, intro_video: Video.find_by_key(intro_video))
      end
    end
  end
end
