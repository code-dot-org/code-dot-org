class CreateProfessionalLearningPartnerTable < ActiveRecord::Migration[4.2]
  def change
    create_table :professional_learning_partners do |t|
      t.string :name, null: false, index: true, unique: true
      t.references :contact, null: false
      t.boolean :urban
    end
  end
end
