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

  def self.by_id(id)
    (@@game_cache_id ||= Game.all.index_by(&:id))[id]
  end

  def self.custom_maze
    @@game_custom_maze ||= find_by_name("CustomMaze")
  end

  def unplugged?
    app == 'unplug'
  end

  def multi?
    app == 'multi'
  end

  def match?
    app == 'match'
  end

  def supports_sharing?
    app == 'turtle' || app == 'flappy' || app == 'bounce' || app == 'studio'
  end

  def share_mobile_fullscreen?
    app == 'flappy' || app == 'bounce' || app == 'studio'
  end

  def flappy?
    app == 'flappy'
  end

  def self.setup
    transaction do
      # Format: name:app:intro_video
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
      ).each_with_index do |game, id|
        name, app, intro_video = game.split ':'
        Game.create!(id: id + 1, name: name, app: app, intro_video: Video.find_by_key(intro_video))
      end
    end
  end
end
