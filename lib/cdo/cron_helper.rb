require 'cdo/hip_chat'

class CronHelper
  CRON_REPORT_ROOM = 'cron-daily'
  def self.report_cron_daily_result(task_name, success)
    status = success ? 'success' : 'failure'
    result_string = "#{task_name} : #{status}"
    color = success ? 'green' : 'red'
    HipChat.message CRON_REPORT_ROOM, result_string, color: color
  end
end
