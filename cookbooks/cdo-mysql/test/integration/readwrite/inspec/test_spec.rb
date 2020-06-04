describe service('proxysql') do
  it {should be_enabled}
  it {should be_running}
end

def cmd(exec, match = nil)
  describe command(exec) do
    if match
      its('stdout') {should match match}
    else
      its('exit_status') {should eq 0}
    end
  end
end

def mysql(query, match = nil)
  cmd "mysql -BNe '#{query}' -h 127.0.0.1 -u root -ptest-password -P 6033", match
end

def admin(query, match = nil)
  cmd "mysql -BNe '#{query}' -h 127.0.0.1 -uadmin -padmin -P 6032", match
end

writer = $writer = '/var/log/mysql-writer/general.log'
reader = $reader = '/var/log/mysql-reader/general.log'

# Assert query went to reader and not writer.
def assert_reader(match)
  cmd "cat #{$reader}", match
  cmd "cat #{$writer}", /(?!#{match})/
end

# Assert query went to writer and not reader.
def assert_writer(match)
  cmd "cat #{$writer}", match
  cmd "cat #{$reader}", /(?!#{match})/
end

cmd "truncate -s0 #{writer}"
cmd "truncate -s0 #{reader}"

# Enable read-write splitting through proxysql admin.
admin 'UPDATE mysql_query_rules set active = 1 where rule_id = 3; LOAD MYSQL QUERY RULES TO RUNTIME;'

# Simple tests to ensure proxy handles read-write splitting:

# DDL goes to writer.
sql = 'CREATE DATABASE IF NOT EXISTS TEST'
mysql sql
assert_writer sql

# SELECT goes to reader.
sql = 'SELECT 5'
mysql sql, '5'
assert_reader sql

# SELECT in transaction goes to writer.
select = 'SELECT 9'
mysql "START TRANSACTION; #{select}; COMMIT", '9'
assert_writer select
