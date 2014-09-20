class ReplaceWhenRunInBounce < ActiveRecord::Migration
  def change
    if Game.where(:name => 'Bounce').first.nil?
      return
    end

    bounce = Game.where(:name => 'Bounce').first.id
    bounce_level = Level.where(:game_id => bounce, :level_num => 12)
    LevelSource.where(level_id: bounce_level).find_each do |level_source|
      level_source.data = level_source.data.sub('bounce_whenGameStarts', 'when_run')
      level_source.md5 = Digest::MD5.hexdigest(level_source.data)
      level_source.save!
    end
  end
end
