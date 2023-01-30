require_relative '../../employee_permissions/tool_permission/code_org_employee_permission'
class SaucelabsEmployeePermission < CodeOrgEmployeePermission
  def self.get_all_members_impl
    raise 'CDO.saucelabs_username undefined' unless CDO.saucelabs_username
    raise 'CDO.saucelabs_authkey undefined' unless CDO.saucelabs_authkey
    next_url = "https://api.us-west-1.saucelabs.com/team-management/v1/users/?status=active&limit=100"
    while next_url
      members_api_response = `curl -s -u "#{CDO.saucelabs_username}:#{CDO.saucelabs_authkey}" --location \
        --request GET '#{next_url}' \
        --header 'Content-Type: application/json' \
        --data-raw '' | json_pp`
      members_json = JSON.parse members_api_response
      next_url = members_json['links']['next']
      members = []
      members_json['results'].each do |member|
        members << {
          id: member['id'],
          search_key: member['email'],
          user_name: member['id'],
          name: member['first_name'] + " " + member['last_name'],
          status: member['status']
        }
      end
    end

    puts members
    return members
  end

  def remove(dry_run=false)
    if dry_run
      puts "Pretending to remove "
    else
      raise 'CDO.saucelabs_username undefined' unless CDO.saucelabs_username
      raise 'CDO.saucelabs_authkey undefined' unless CDO.saucelabs_authkey
      puts "Not Pretending to remove "
      #`curl -s -u "#{CDO.saucelabs_username}:#{CDO.saucelabs_authkey}" --location \
      #  --request POST 'https://api.us-west-1.saucelabs.com/team-management/v1/users/#{@opts[:id]}/deactivate' \
      #  --header 'Content-Type: application/json' | json_pp``
    end
  end
end
