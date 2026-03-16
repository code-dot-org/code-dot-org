require "mysql2"
require "uri"
require "yaml"

class HomeController < ApplicationController
  def index
    @db = db_status
  end

  def health_check
    db = db_status
    status = db[:ok] ? :ok : :service_unavailable
    render plain: db[:message], status: status
  end

  private def db_status
    writer_url = locals_yml["db_writer"].presence || ENV["DATABASE_URL"].presence
    return {ok: true, message: "ok (no db configured)"} unless writer_url

    uri = URI.parse(writer_url)
    client = Mysql2::Client.new(
      host: uri.host,
      port: uri.port || 3306,
      username: URI.decode_www_form_component(uri.user || "root"),
      password: uri.password && URI.decode_www_form_component(uri.password),
      database: uri.path.sub(%r{^/}, "").presence,
      connect_timeout: 2,
      read_timeout: 2,
      write_timeout: 2
    )
    result = client.query("SELECT 1 AS status").first
    {ok: result && result["status"] == 1, message: "ok (db connected to #{uri.host})"}
  rescue StandardError => exception
    {ok: false, message: "db connection failed: #{exception.class}: #{exception.message}"}
  ensure
    client&.close
  end

  private def locals_yml
    @locals_yml ||= begin
      path = "/code-dot-org/locals.yml"
      if File.exist?(path)
        YAML.safe_load_file(path, aliases: true) || {}
      else
        {}
      end
    end
  end
end
