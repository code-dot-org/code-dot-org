require 'honeybadger/ruby'
require_relative '../../../lib/cdo/honeybadger/honeybadger_fault'
require_relative '../env'
# Class to extract and handle faults reported by HoneyBadger
class HoneybadgerFaultAnalyzer
  def initialize(honeybadger_url_builder)
    @honeybadger_url_builder = honeybadger_url_builder
    @cron_jobs_project_id = 45435
    @dashboard_project_id = 3240
    @pegasus_project_id = 34365
  end

  def get_faults_for_project(project_id)
    faults = []
    current_count = 0
    next_url = @honeybadger_url_builder.get_api_url_request("faults", {project_id: project_id})
    while next_url
      parsed_response = @honeybadger_url_builder.call_api_response_from_url(next_url)
      if parsed_response['results'].nil?
        break
      end
      parsed_response['results'].each do |fault|
        faults << HoneybadgerFault.new(@honeybadger_url_builder, fault)
        current_count += 1
      end
      next_url = parsed_response['links']['next']
    end
    faults
  end

  def get_faults
    validate_api_token!
    faults = []
    get_all_projects_and_ids.each do |_, project_id|
      faults << get_faults_for_project(project_id)
    end
    faults
  end

  def get_reports(project_id)
    validate_api_token!
    @honeybadger_url_builder.get_api_response("reports_by_user", {project_id: project_id})
  end

  private

  def get_all_projects_and_ids
    {cronjobs: @cron_jobs_project_id, dashboard: @dashboard_project_id, pegasus: @pegasus_project_id}
  end

  # Make sure the token is correctly setup and if not, raise an exception
  def validate_api_token!
    raise 'CDO.honeybadger_api_token undefined' unless CDO.honeybadger_api_token
  end
end
