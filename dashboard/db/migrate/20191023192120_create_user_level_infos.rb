class CreateUserLevelInfos < ActiveRecord::Migration[5.0]
  def change
    create_table :user_level_infos do |t|
      t.integer :time_spent, default: 0
      t.bigint :user_level_id, unsigned: true
    end
  end
end
