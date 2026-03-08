# Mock CDO because jemalloc.rb calls CDO.dashboard_use_jemalloc
module CDO
  def self.dashboard_use_jemalloc
    value = ENV.fetch('USE_JEMALLOC', '0').downcase
    value == '1'
  end
end

require_relative './jemalloc'

exec('bash', '-lc', "#{Cdo::Jemalloc.jemalloc_env} ruby ./jemalloc_check.rb")
