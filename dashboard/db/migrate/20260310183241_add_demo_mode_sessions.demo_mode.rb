# frozen_string_literal: true

# This migration comes from demo_mode (originally 20190503143021)
class AddDemoModeSessions < ActiveRecord::Migration[5.1]
  def change
    # Uncomment this line to enable :uuid support on PostgreSQL >= 9.4
    # enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')
    #
    # Uncomment this line to enable :uuid support on PostgreSQL < 9.4
    # enable_extension 'uuid-ossp' unless extension_enabled?('uuid-ossp')

    create_table :demo_mode_sessions, id: primary_key_type do |t|
      t.string :persona_name, null: false
      t.references :signinable, polymorphic: true, type: :string
      t.timestamps
    end
  end

  private

  def primary_key_type
    if connection.adapter_name.casecmp('postgresql').zero? &&
        (extension_enabled?('pgcrypto') || extension_enabled?('uuid-ossp'))
      :uuid
    else
      :bigint
    end
  end
end
