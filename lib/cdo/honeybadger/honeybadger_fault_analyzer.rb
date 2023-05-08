require 'honeybadger/ruby'
require_relative '../../../lib/cdo/honeybadger/honeybadger_fault'
require_relative '../env'
# Class to extract and handle faults reported by HoneyBadger
class HoneybadgerFaultAnalyzer
  def initialize(filters)
    @filters = filters
    @cron_jobs_project_id = 45435
    @dashboard_project_id = 3240
    @pegasus_project_id = 34365
  end

  def get_faults
    validate_api_token!
    faults = []
    get_all_projects_and_ids.each do |_, project_id|
      next_url = get_faults_url(project_id)
      puts next_url
      while next_url
        puts "https://app.honeybadger.io#{next_url}"

        response = `curl -u #{CDO.honeybadger_api_token}: "https://app.honeybadger.io#{next_url}"`
        puts "response&11"
        puts response
        puts "response&"
        unless response
          break
        end
        parsed_response = JSON.parse response
        parsed_response['results'].each do |fault|
          faults << HoneybadgerFault.new(fault)
        end
        next_url = parsed_response['links']['next']
      end
    end
    faults
  end

  private

  def get_all_projects_and_ids
    {cronjobs: @cron_jobs_project_id, dashboard: @dashboard_project_id, pegasus: @pegasus_project_id}
  end

  # Make sure the token is correctly setup and if not, raise an exception
  def validate_api_token!
    raise 'CDO.honeybadger_api_token undefined' unless CDO.honeybadger_api_token
  end

  # join the filters by a 'white space' or "%20"
  # This is used while a better query builder for honeybadger is implemented
  def get_query
    @filters.join("%20")
  end

  def get_faults_url(project_id)
    "/v2/projects/#{project_id}/faults&q=#{get_query}"
  end
end
