require_relative '../../../lib/cdo/honeybadger'
require_relative '../../employee_permissions/tool_permission/code_org_employee_permission'
class HoneybadgerEmployeePermission < CodeOrgEmployeePermission
  def remove(dry_run=false)
    raise 'CDO.honeybadger_api_token undefined' unless CDO.honeybadger_api_token
    if dry_run
      puts "Pretending to remove #{name} from honeybadger"
    else
      puts "Not Pretending to remove #{name}"
      #Honeybadger.delete_member(id)
    end
  end

  def self.get_all_members_impl
    Honeybadger.get_members
  end
end
