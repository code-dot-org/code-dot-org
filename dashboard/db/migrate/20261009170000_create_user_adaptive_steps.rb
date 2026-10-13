class CreateUserAdaptiveSteps < ActiveRecord::Migration[7.0]
  def change
    create_table :user_adaptive_steps, charset: "utf8mb4", collation: "utf8mb4_unicode_ci" do |t|
      t.bigint :user_level_id, unsigned: true, null: false
      t.string :step_id, null: false
      t.json :progress
      t.json :validation_history
      t.json :generated_instructions

      t.timestamps

      t.index [:user_level_id, :step_id], unique: true
    end
  end
end
