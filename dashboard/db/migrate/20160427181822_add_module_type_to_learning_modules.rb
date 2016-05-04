class AddModuleTypeToLearningModules < ActiveRecord::Migration
  def up
    add_column :plc_learning_modules, :module_type, :string

    #Make the modules that were required have module_type REQUIRED
    Plc::LearningModule.where(required: true).update_all(module_type: Plc::LearningModule::REQUIRED_MODULE)

    remove_column :plc_learning_modules, :required
  end

  def down
    add_column :plc_learning_modules, :required, :boolean

    Plc::LearningModule.where(module_type: Plc::LearningModule::REQUIRED_MODULE).update_all(required: true)

    remove_column :plc_learning_modules, :module_type
  end
end
