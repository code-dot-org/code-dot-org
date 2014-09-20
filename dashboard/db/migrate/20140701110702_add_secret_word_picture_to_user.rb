class AddSecretWordPictureToUser < ActiveRecord::Migration
  def change
    add_column :users, :secret_picture_id, :integer
    add_column :users, :secret_word_1_id, :integer
    add_column :users, :secret_word_2_id, :integer
  end
end
