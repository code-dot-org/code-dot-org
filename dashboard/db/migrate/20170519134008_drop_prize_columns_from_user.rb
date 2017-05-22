class DropPrizeColumnsFromUser < ActiveRecord::Migration[5.0]
  def change
    remove_index :users, [:prize_id, :deleted_at]
    remove_index :users, [:teacher_prize_id, :deleted_at]
    remove_index :users, [:teacher_bonus_prize_id, :deleted_at]

    remove_column :users, :prize_id, :integer
    remove_column :users, :teacher_prize_id, :integer
    remove_column :users, :teacher_bonus_prize_id, :integer

    remove_column :users, :prize_earned, :tinyint
    remove_column :users, :teacher_prize_earned, :tinyint
    remove_column :users, :teacher_bonus_prize_earned, :tinyint

    remove_column :users, :prize_teacher_id, :integer
  end
end
