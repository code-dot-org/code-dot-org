class CreateProfessionalLearningModule < ActiveRecord::Migration
  def change
    create_table :professional_learning_modules do |t|
      t.string :name
      t.string :learning_module_type
    end
  end
end
