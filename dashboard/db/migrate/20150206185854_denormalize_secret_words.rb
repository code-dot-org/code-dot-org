class DenormalizeSecretWords < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :secret_words, :string
    execute <<SQL
update users set secret_words =
  (select concat((select word from secret_words where id = secret_word_1_id),
                 ' ',
                 (select word from secret_words where id = secret_word_2_id)))
SQL
    remove_column :users, :secret_word_1_id
    remove_column :users, :secret_word_2_id
  end
end
