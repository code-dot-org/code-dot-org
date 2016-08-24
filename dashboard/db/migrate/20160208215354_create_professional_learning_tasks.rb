class CreateProfessionalLearningTasks < ActiveRecord::Migration[4.2]
  def change
    create_table :professional_learning_tasks do |t|
      t.string :name
      t.string :description
      t.references :professional_learning_module, index: {name: 'task_learning_module_index'}, foreign_key: true
    end
  end
end
