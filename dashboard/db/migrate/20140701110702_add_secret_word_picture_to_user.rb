class AddSecretWordPictureToUser < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :secret_picture_id, :integer
    add_column :users, :secret_word_1_id, :integer
    add_column :users, :secret_word_2_id, :integer
  end
end
