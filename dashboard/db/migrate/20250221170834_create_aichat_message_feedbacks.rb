class CreateAichatMessageFeedbacks < ActiveRecord::Migration[6.1]
  def change
    create_table :aichat_message_feedbacks do |t|
      t.belongs_to :aichat_message, null: false, index: {unique: true}, foreign_key: true
      t.bigint :teacher_id, null: false
      t.boolean :approval
      t.boolean :flagged

      t.timestamps
    end
  end
end
