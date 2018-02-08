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
  SCRATCH = 'scratch'.freeze

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

  def self.scratch
    @@game_scratch ||= find_by_name('Scratch')
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
    ].include? app
  end

  def sharing_filtered?
    app == STUDIO
  end

  def flappy?
    app == FLAPPY
  end

  def uses_droplet?
    %w(MazeEC ArtistEC Applab StudioEC Gamelab).include? name
  end

  def uses_pusher?
    app == NETSIM
  end

  def uses_small_footer?
    [NETSIM, APPLAB, TEXT_COMPRESSION, GAMELAB, WEBLAB, SCRATCH].include? app
  end

  # True if the app takes responsibility for showing footer info
  def owns_footer_for_share?
    [APPLAB, WEBLAB].include? app
  end

  def has_i18n?
    !([NETSIM, APPLAB, GAMELAB, WEBLAB].include? app)
  end

  def use_firebase?
    [APPLAB, GAMELAB].include? app
  end

  def channel_backed?
    [APPLAB, GAMELAB, WEBLAB, SCRATCH, PIXELATION].include? app
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
        FreeResponse:free_response
        NotUsed:not_used
        StandaloneVideo:standalone_video
        ExternalLink:external_link
        EvaluationMulti:evaluation_multi
        PublicKeyCryptography:public_key_cryptography
        Weblab:weblab
        CurriculumReference:curriculum_reference
        Map:map
        CustomFlappy:flappy
        Scratch:scratch
      ).each_with_index do |game, id|
        name, app, intro_video = game.split ':'
        Game.create!(id: id + 1, name: name, app: app, intro_video: Video.find_by_key(intro_video))
      end
    end
  end
end
