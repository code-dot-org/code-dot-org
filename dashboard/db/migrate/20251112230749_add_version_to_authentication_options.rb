class AddVersionToAuthenticationOptions < ActiveRecord::Migration[6.1]
  def change
    add_column :authentication_options, :version, :string, limit: 64
  end
end
