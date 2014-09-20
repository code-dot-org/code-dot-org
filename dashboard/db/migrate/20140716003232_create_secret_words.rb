class CreateSecretWords < ActiveRecord::Migration
  def change
    create_table :secret_words do |t|
      t.string :word, null: false
      t.timestamps

      t.index :word, unique: true
    end
  end
end
