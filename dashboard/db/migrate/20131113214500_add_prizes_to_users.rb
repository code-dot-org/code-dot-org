class AddPrizesToUsers < ActiveRecord::Migration
  def change
    add_column :users, :prize_earned, :boolean,               default: false
    add_reference :users, :prize
    add_column :users, :teacher_prize_earned, :boolean,       default: false
    add_reference :users, :teacher_prize
    add_column :users, :teacher_bonus_prize_earned, :boolean, default: false
    add_reference :users, :teacher_bonus_prize
    
    add_index :users, :prize_id,                              unique: true
    add_index :users, :teacher_prize_id,                      unique: true
    add_index :users, :teacher_bonus_prize_id,                unique: true
  end
end
