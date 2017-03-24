require 'cdo/chat_client'

class CronHelper
  CRON_REPORT_ROOM = 'cron-daily'.freeze
  def self.report_cron_daily_result(task_name, success)
    status = success ? 'success' : 'failure'
    result_string = "#{task_name} : #{status}"
    color = success ? 'green' : 'red'
    ChatClient.message CRON_REPORT_ROOM, result_string, color: color
  end
end
