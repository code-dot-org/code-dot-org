class CreateDonors < ActiveRecord::Migration[5.0]
  def change
    create_table :donors do |t|
      t.string :name
      t.string :url
      t.string :show
      t.string :twitter
      t.string :level
      t.float :weight
      t.float :twitter_weight

      t.timestamps
    end
  end
end
