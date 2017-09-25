class DropPrizeTables < ActiveRecord::Migration[5.0]
  def up
    drop_table :prizes
    drop_table :teacher_prizes
    drop_table :teacher_bonus_prizes
    drop_table :prize_providers
  end
end
