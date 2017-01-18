class ChangeBestResultForContainedLevels < ActiveRecord::Migration[5.0]
  def change
    # Find all existing UserLevels for contained levels, and update their best
    # result to be CONTAINED_LEVEL_RESULT (101)
    containers = Level.all.select{|x| !x.contained_levels.empty?}
    contained_level_ids = containers.map{|x| x.contained_levels[0].id}
    UserLevel.where(level_id: contained_level_ids).update_all(best_result: 101)
  end
end
