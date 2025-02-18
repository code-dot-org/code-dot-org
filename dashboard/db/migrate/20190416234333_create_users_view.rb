require 'cdo/sequel'

class CreateUsersView < ActiveRecord::Migration[5.0]
  DASHBOARD_REPORTING_DB_WRITER = Cdo::Sequel.database_connection_pool(CDO.dashboard_reporting_db_writer, CDO.dashboard_reporting_db_reader)
  def up
    # Remove existing users_view, which was provisioned manually (20180428013942_add_multi_auth_view_to_reporting_db.rb)
    DASHBOARD_REPORTING_DB_WRITER.run "DROP VIEW IF EXISTS users_view"
    # Re-provision users_view using the Scenic gem
    create_view :users_view
  end

  def down
    # Create the view again manually if the attempt to create it with Scenic failed.
    DASHBOARD_REPORTING_DB_WRITER.run <<-MULTILINE
      CREATE OR REPLACE VIEW users_view AS
      SELECT
        users.id, studio_person_id,
        IF(users.provider = 'migrated', authentication_options.email, users.email) as email,
        parent_email, encrypted_password, reset_password_token, reset_password_sent_at, remember_created_at,
        sign_in_count, current_sign_in_at, last_sign_in_at, current_sign_in_ip, last_sign_in_ip,
        users.created_at as created_at, users.updated_at as updated_at, username, provider, uid, admin, gender, name,
        locale, birthday, user_type, school, full_address, school_info_id, total_lines, secret_picture_id, active,
        IF(users.provider = 'migrated', authentication_options.hashed_email, users.hashed_email) as hashed_email,
        users.deleted_at as deleted_at, purged_at, secret_words, properties, invitation_token, invitation_created_at,
        invitation_sent_at, invitation_accepted_at, invitation_limit, invited_by_id, invited_by_type,
        invitations_count, terms_of_service_version, urm, races, primary_contact_info_id
      FROM users
      LEFT JOIN authentication_options
        ON users.primary_contact_info_id = authentication_options.id
    MULTILINE
  end
end
