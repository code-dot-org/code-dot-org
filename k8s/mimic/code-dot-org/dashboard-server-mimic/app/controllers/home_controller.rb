class HomeController < ApplicationController
  def index
    status = ServerStatus.new
    @db_connection = status.db_health_check
    @read_data_docs_sql_table = status.read_data_docs_sql_table
    @redis_connection = status.redis_connection
    @s3_status = status.s3_status
  end

  def health_check
    db = ServerStatus.new.db_health_check
    status = db[:ok] ? :ok : :service_unavailable
    render plain: db[:message], status: status
  end
end
