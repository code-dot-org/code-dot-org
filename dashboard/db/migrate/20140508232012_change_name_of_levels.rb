class ChangeNameOfLevels < ActiveRecord::Migration
  OLD_TO_NEW = {
                "Edit Code" => 'edit-code',
                "2014 Levels" => 'events',
                "Builder Levels" => 'builder',
                "Flappy Levels" => 'flappy',
                "Jigsaw Levels" => 'jigsaw',
                "Maze Step Levels" => 'step'
               }

  def up
    OLD_TO_NEW.each do |old, new|
      Script.find_by_name(old).try(:update, {name: new})
    end
  end

  def down
    OLD_TO_NEW.each do |old, new|
      Script.find_by_name(new).try(:update, {name: old})
    end
  end
end
