# curriculum_load.rb — drive concurrent GETs at curriculum pages to induce the GC
# churn that erodes copy-on-write sharing in the puma workers. Stdlib only; runs
# anywhere (your laptop, against the adhoc). Reads/writes nothing but stdout.
#
# Reads itself do not dirty the warmed old-gen objects — request handling does, by
# allocating transient objects that drive major GC, which marks (and so dirties the
# pages of) the shared old-gen curriculum records. This generates that load.
#
#   ruby bin/oneoff/curriculum_load.rb BASE_URL URLS_FILE
#
#   BASE_URL   e.g. https://adhoc-preload-warm-curriculum-studio.cdn-code.org
#   URLS_FILE  output of bin/oneoff/curriculum_urls.rb
#
# Tunables (env):
#   CONCURRENCY  parallel workers              (default: 16)
#   DURATION     seconds to sustain load       (default: 120; ignored if REQUESTS set)
#   REQUESTS     stop after N requests total   (default: unset)
#   FOLLOW       follow redirects 1/0          (default: 0 — a 302 to sign-in means the
#                                               page was auth-gated and read no curriculum)
#   INSECURE     skip TLS verification 1/0     (default: 0)
#   TIMEOUT      per-request seconds           (default: 15)
#   BUST         append ?cb=<n> to force origin past any CDN/HTTP cache (default: 0).
#                Set this if the host is CDN-fronted; otherwise cached HTML may be
#                served without ever reaching Rails (and so reading no curriculum).

require 'net/http'
require 'uri'
require 'openssl'
require 'thread'

base      = ARGV[0] or abort "usage: ruby curriculum_load.rb BASE_URL URLS_FILE"
urls_file = ARGV[1] or abort "usage: ruby curriculum_load.rb BASE_URL URLS_FILE"
base_uri  = URI.parse(base)

concurrency = (ENV['CONCURRENCY'] || 16).to_i
duration    = (ENV['DURATION'] || 120).to_i
max_reqs    = ENV.fetch('REQUESTS', nil) && ENV['REQUESTS'].to_i
follow      = ENV['FOLLOW'] == '1'
insecure    = ENV['INSECURE'] == '1'
timeout     = (ENV['TIMEOUT'] || 15).to_i
bust        = ENV['BUST'] == '1'

# Each line is "<weight>\t<path>" (from curriculum_urls.rb) or a bare "<path>" (weight 1).
parse_weight = lambda do |token|
  Float(token)
rescue ArgumentError, TypeError
  nil
end
entries = File.readlines(urls_file, chomp: true).reject {|l| l.empty? || l.start_with?('#')}.map do |line|
  w, p = line.split(/\s+/, 2)
  weight = p && parse_weight.call(w)
  weight ? [weight, p] : [1.0, line.strip]
end
abort "no paths in #{urls_file}" if entries.empty?
paths   = entries.map(&:last)
weights = entries.map(&:first)
# Cumulative weights for O(log n) weighted-random selection.
cum = []
running = 0.0
weights.each {|w| running += w; cum << running}
total_weight = running

mono = -> {Process.clock_gettime(Process::CLOCK_MONOTONIC)}
deadline = mono.call + duration
started  = mono.call

mutex      = Mutex.new
count      = 0          # requests issued
done       = 0          # requests completed
status_hist = Hash.new(0)
signin     = 0          # 302 -> sign-in (auth-gated, no curriculum read)
errors     = Hash.new(0)
latencies  = []         # seconds, completed requests

take_path = lambda do
  mutex.synchronize do
    return nil if max_reqs && count >= max_reqs
    return nil if !max_reqs && mono.call >= deadline
    count += 1
  end
  # Weighted-random pick (outside the lock; pure). bsearch finds first cum > r.
  r = rand * total_weight
  idx = cum.bsearch_index {|c| c > r} || (paths.size - 1)
  paths[idx]
end

build_http = lambda do
  http = Net::HTTP.new(base_uri.host, base_uri.port)
  http.use_ssl = (base_uri.scheme == 'https')
  http.verify_mode = OpenSSL::SSL::VERIFY_NONE if insecure
  http.open_timeout = timeout
  http.read_timeout = timeout
  http.keep_alive_timeout = 30
  http.start
  http
end

signin_redirect = lambda do |resp|
  loc = resp['location'].to_s
  resp.code.to_i.between?(300, 399) && (loc.include?('sign_in') || loc.include?('/users/') || loc.include?('oauth'))
end

worker = lambda do
  http = build_http.call
  while (path = take_path.call)
    t0 = mono.call
    req_path = if bust
                 "#{path}#{path.include?('?') ? '&' : '?'}cb=#{t0.to_i}#{rand(1_000_000)}"
               else
                 path
               end
    begin
      resp = http.request(Net::HTTP::Get.new(req_path, 'User-Agent' => 'curriculum-load/1.0'))
      if follow && resp.code.to_i.between?(300, 399) && resp['location'] && !signin_redirect.call(resp)
        loc = URI.join(base, resp['location'])
        resp = http.request(Net::HTTP::Get.new(loc.request_uri))
      end
      dt = mono.call - t0
      mutex.synchronize do
        done += 1
        latencies << dt
        status_hist[resp.code.to_i] += 1
        signin += 1 if signin_redirect.call(resp)
      end
    rescue StandardError => exception
      mutex.synchronize {errors[exception.class.to_s] += 1}
      http = begin
        build_http.call
      rescue
        http
      end
    end
  end
  http.finish if http&.started?
rescue StandardError
  # worker exit; nothing to clean up
end

# Periodic progress line.
reporter = Thread.new do
  last = 0
  loop do
    sleep 5
    snap_done, snap_signin = mutex.synchronize {[done, signin]}
    break if (max_reqs && snap_done >= max_reqs) || (!max_reqs && mono.call >= deadline)
    elapsed = mono.call - started
    rps = (snap_done - last) / 5.0
    last = snap_done
    warn format("t=%4ds done=%-7d rps=%-7.1f signin_redirects=%d", elapsed.to_i, snap_done, rps, snap_signin)
  end
end

threads = Array.new(concurrency) {Thread.new {worker.call}}
threads.each(&:join)
reporter.kill

elapsed = mono.call - started
lat = latencies.sort
pct = ->(p) {lat.empty? ? 0 : lat[[(lat.size * p).to_i, lat.size - 1].min]}

ok = status_hist.select {|c, _| c.between?(200, 299)}.values.sum
puts
puts "==== curriculum load summary ===="
puts "base            #{base}"
puts "paths           #{paths.size} unique"
puts "concurrency     #{concurrency}"
puts "elapsed         #{elapsed.round(1)}s"
puts "completed       #{done}  (#{(done / elapsed).round(1)} req/s)"
puts "2xx (curriculum reads)  #{ok}"
puts "sign-in redirects (auth-gated, no read)  #{signin}"
puts "status histogram        #{status_hist.sort.map {|c, n| "#{c}:#{n}"}.join(' ')}"
puts "errors                  #{errors.empty? ? 'none' : errors.map {|k, v| "#{k}:#{v}"}.join(' ')}"
puts "latency  p50=#{(pct.call(0.50) * 1000).round}ms  p90=#{(pct.call(0.90) * 1000).round}ms  p99=#{(pct.call(0.99) * 1000).round}ms"
