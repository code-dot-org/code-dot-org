class ReplaceOldWhenRunBlocks < ActiveRecord::Migration
  def change
    if Game.where(:name => 'Flappy').first.nil?
      return
    end

    flappy = Game.where(:name => 'Flappy').first.id
    studio = Game.where(:name => 'Studio').first.id

    flappy_level = Level.where(:game_id => flappy, :level_num => 11)
    studio_levels = Level.where(:game_id => studio, level_num: ['k1_studio_simple', 99, 100])

    LevelSource.where(level_id: flappy_level).find_each do |level_source|
      level_source.data = level_source.data.sub('flappy_whenRunButtonClick', 'when_run')
      level_source.md5 = Digest::MD5.hexdigest(level_source.data)
      level_source.save!
    end

    LevelSource.where(level_id: studio_levels).find_each do |level_source|
      level_source.data = level_source.data.sub('studio_whenGameStarts', 'when_run')
      level_source.md5 = Digest::MD5.hexdigest(level_source.data)
      level_source.save!
    end
  end
end
