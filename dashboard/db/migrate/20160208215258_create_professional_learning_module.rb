class CreateProfessionalLearningModule < ActiveRecord::Migration[4.2]
  def change
    create_table :professional_learning_modules do |t|
      t.string :name
      t.string :learning_module_type
    end
  end
end
