class AddUniqueConstraintToProfessionalLearningPartners < ActiveRecord::Migration[5.0]
  def change
    change_table :professional_learning_partners do |t|
      t.remove_index column: :name
      t.index [:name, :contact_id], unique: true
    end
  end
end
