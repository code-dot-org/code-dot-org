class HomeController < ApplicationController
  def index
    load_status
  end

  def health_check
    load_status
    render partial: "status", status: @mysql_status[:connected] ? :ok : :service_unavailable
  end

  private def load_status
    status = ServerStatus.new
    @mysql_status = status.mysql_status
    @redis_status = status.redis_status
    @s3_status = status.s3_status
    @server_status =
      if @mysql_status[:connected] && @mysql_status[:populated] && @redis_status[:connected] && @s3_status[:connected]
        "HEALTHY"
      elsif @mysql_status[:connected]
        "PARTIALLY DEGRADED"
      else
        "NOT HEALTHY"
      end
  end
end
