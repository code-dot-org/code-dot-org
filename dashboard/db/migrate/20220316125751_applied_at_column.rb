class AppliedAtColumn < ActiveRecord::Migration[5.2]
  def change
    reversible do |dir|
      dir.up do
        add_column :pd_applications, :applied_at, :datetime
        Pd::Application::ApplicationBase.all.each do |application|
          application.update_column(:applied_at, application.created_at)
        end
      end
      dir.down do
        remove_column :pd_applications, :applied_at, :datetime
      end
    end
  end
end
