# A view was added to the reporting database that conditionally picks up the primary email address of a user who has
# been migrated to the multiauth system or the standard email attribute for users who have not been migrated yet:
# https://github.com/code-dot-org/code-dot-org/blob/staging/dashboard/db/migrate/20180428013942_add_multi_auth_view_to_reporting_db.rb
#
# This model can be used by reporting clients, such as Contact Rollups, for read-only access to Users via the multi
# auth view.
class MultiAuthUserView < User
  establish_connection("read_pool")
  self.table_name = 'users_view'
end
