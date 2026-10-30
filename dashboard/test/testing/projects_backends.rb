# Runs a test class against one implementation of Projects and the storage_id.rb database helpers: Sequel by default,
# or ActiveRecord in a subclass that sets `self.projects_backend = :active_record`, which reruns every inherited test.
module ProjectsBackends
  extend ActiveSupport::Concern

  included do
    class_attribute :projects_backend, default: :sequel

    setup do
      Projects.stubs(:active_record?).returns(active_record_backend?)
    end
  end

  def active_record_backend?
    projects_backend == :active_record
  end

  # Sequel writes on its own connection, outside the transaction that rolls back ActiveRecord's writes.
  def run
    DASHBOARD_DB.transaction(rollback: :always, auto_savepoint: true) {super}
  end

  # Inserts through the connection of the backend under test; the other backend cannot see the uncommitted row.
  def insert_row(table, attributes)
    sql = DASHBOARD_DB[table].insert_sql(attributes)
    active_record_backend? ? ActiveRecord::Base.connection.insert(sql) : DASHBOARD_DB[table].insert(attributes)
  end

  def update_rows(table, where, attributes)
    sql = DASHBOARD_DB[table].where(where).update_sql(attributes)
    active_record_backend? ? ActiveRecord::Base.connection.update(sql) : DASHBOARD_DB.run(sql)
  end
end
