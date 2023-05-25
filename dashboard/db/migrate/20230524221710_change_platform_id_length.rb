class ChangePlatformIdLength < ActiveRecord::Migration[6.1]
  def change
    change_column :lti_integrations, :platform_id, :string, {limit: 32}
  end
end
