class CreateUserFacilitatorInfos < ActiveRecord::Migration[6.1]
  def change
    create_table :user_facilitator_infos do |t|
      t.belongs_to :user, type: :integer, null: false, foreign_key: true
      t.text :bio
      t.timestamps
    end
  end
end
