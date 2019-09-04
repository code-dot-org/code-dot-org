#!/usr/bin/env ruby
require_relative '../../../dashboard/config/environment'
require 'ipaddr'
require 'json'

# According to the diff in
# https://github.com/code-dot-org/code-dot-org/pull/28635/files, the IP address
# list was last updated on 2017-11-17 12:25:11 -0800 so we only consider
# usergeos created after that
# mysql> select id from user_geos where created_at > "2017-11-17 12:25:11 -0800" limit 1;
first_id = 23_153_485

# The PR which updates the IP address list was merged on 2019-05-20T20:38:24Z,
# so we only consider usergeos created before May 21st
# https://github.com/code-dot-org/code-dot-org/pull/28655
# mysql> select id from user_geos where created_at > "2019-05-21" limit 1;
last_id = 40_674_270

proxy_ip_ranges = JSON.parse(File.read('lib/cdo/trusted_proxies.json'))['ranges'].map do |ip|
  IPAddr.new(ip).to_range
end

ActiveRecord::Base.connection.execute(%(DELETE FROM user_geos
  WHERE (
    id >= #{first_id} AND
    id <= #{last_id}
  ) AND (
    #{proxy_ip_ranges.map do |range|
      "(INET_ATON(ip_address) BETWEEN INET_ATON('#{range.first}') AND INET_ATON('#{range.last}'))"
    end.join(" OR \n    ")}
  )
  ORDER BY id
  LIMIT 1000;)
)
