#!/usr/bin/env ruby
require_relative '../deployment'
require_relative '../lib/cdo/honeybadger'
require_relative 'employee_permissions/tool_permission/honeybadger_employee_permission'
require_relative 'employee_permissions/tool_permission/github_employee_permission'
def main
  puts "Tool to onboard/off board employees"

  search_key = 'pablo@code.org'
  permissions = HoneybadgerEmployeePermission.get_member_from_search_key(search_key)
  search_key = 'pablo-code-org'
  permissions += GithubEmployeePermission.get_member_from_search_key(search_key)
  puts permissions
  dry_run = true
  permissions.each do |permission|
    permission.remove(dry_run)
  end
end
main
