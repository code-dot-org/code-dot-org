class CreatePrizeProviders < ActiveRecord::Migration
  def change
    create_table :prize_providers do |t|
      t.string :name
      t.string :url
      t.string :description_token
      t.string :image_name

      t.timestamps
    end
  end
end
