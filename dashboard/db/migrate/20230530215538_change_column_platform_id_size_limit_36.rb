class ChangeColumnPlatformIdSizeLimit36 < ActiveRecord::Migration[6.1]
  def change
    change_column :lti_integrations, :platform_id, :string, {limit: 36}
  end
end
