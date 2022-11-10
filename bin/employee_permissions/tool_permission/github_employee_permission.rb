require_relative '../../../lib/cdo/honeybadger'
require_relative '../../employee_permissions/tool_permission/code_org_employee_permission'
class GithubEmployeePermission < CodeOrgEmployeePermission
  @@github_token = ''
  @@org_name = 'code-dot-org'

  def self.get_teams
    teams_curl_response = `curl -s \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer #{@@github_token}" \
      https://api.github.com/orgs/#{@@org_name}/teams`
    JSON.parse teams_curl_response
  end

  def self.get_team_members(team_slug)
    teams_members_curl_response = `curl -s \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer #{@@github_token}" \
      https://api.github.com/orgs/#{@@org_name}/teams/#{team_slug}/members`
    JSON.parse teams_members_curl_response
  end

  def self.get_role(team_slug, user_name)
    role_curl_response = `curl -s \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer #{@@github_token}" \
      https://api.github.com/orgs/#{@@org_name}/teams/#{team_slug}/memberships/#{user_name}`
    parse_response = JSON.parse role_curl_response
    parse_response['role']
  end

  def self.get_all_members_impl
    members = []
    teams = get_teams
    teams.each do |team|
      team_slug = team['slug']
      team_members = get_team_members(team_slug)
      team_members.each do |member|
        member_user_name = member['login']
        members << {
          id: member['id'],
          search_key: member_user_name,
          role: get_role(team_slug, member_user_name),
          user_name: member_user_name,
          org_name: @@org_name,
          team_name: team['name'],
          team_slug: team['slug']
        }
      end
    end
    return members
  end

  def remove(dry_run=false)
    if dry_run
      puts "Pretending to remove #{@opts[:user_name]} from #{@@org_name}/#{@opts[:team_slug]}"
    else
      puts "Not Pretending to remove #{@opts[:user_name]} from #{@@org_name}/#{@opts[:team_slug]}"
      # `curl \
      #  -X DELETE \
      #  -H "Accept: application/vnd.github+json" \
      #  -H "Authorization: Bearer #{@@github_token}" \
      #  https://api.github.com/orgs/#{@@org_name}/teams/#{team_slug}/memberships/#{user_name}`
    end
  end
end
