require_relative './test_helper'
require_relative '../router'
require 'helpers/auth_helpers'
require 'cdo/rack/request'
require 'shared_resources'
require 'parallel'
require 'open3'
require 'digest'
require 'yaml'
require 'tempfile'
require 'zlib'

# Runs integration tests against the full Pegasus document repository.
class PegasusTest < Minitest::Test
  include Rack::Test::Methods
  include CaptureQueries

  def app
    @app ||= Documents.new
  end

  def test_pegasus_documents
    documents = Documents.new.helpers.all_documents.map do |page|
      "#{page[:site]}#{page[:uri]}"
    end
    CDO.log.info "Found #{documents.length} Pegasus documents."
    assert_operator documents.length, :>, 2000
  end

  # All documents expected to return 200 status-codes, with the following exceptions:
  STATUS_EXCEPTIONS = {
    302 => %w[
      code.org/amazon-future-engineer
      code.org/educate
      code.org/review-hociyskvuwa
      code.org/teach
      code.org/student
    ],
    301 => %w[
      csedweek.org/resource_kit
    ],
    401 => %w[
      code.org/create-company-profile
    ]
  }

  # All documents expected to return 'text/html' content-type, with the following exceptions:
  CONTENT_TYPE_EXCEPTIONS = {
    'text/plain' => %w[
      code.org/health_check
      code.org/robots.txt
    ]
  }

  # All documents expected to have unchanged content between runs, with the following exceptions:
  # (TODO: remove all randomness in server-generated content from these pages.)
  CONTENT_CHANGE_EXCEPTIONS = %w[
    code.org
    code.org/about
    code.org/about/jobs
    code.org/athletes
    code.org/congrats
    code.org/educate/curriculum/elementary-school
    code.org/educate/curriculum/high-school
    code.org/educate/curriculum/middle-school
    code.org/educate/resources/inspire
    code.org/educate/resources/videos
    code.org/learn/robotics
    code.org/minecraft
    code.org/playlab
    code.org/promote
    code.org/starwars
    code.org/leaderboards
    code.org/page_mode
  ]

  def test_render_pegasus_documents
    all_documents = app.helpers.all_documents.reject do |page|
      # 'Splat' documents not yet handled.
      page[:uri].end_with?('/splat') ||
      # Private routes not yet handled.
      page[:uri].start_with?('/private')
    end

    tidy = system('which tidy >/dev/null 2>&1')
    warn '`tidy` not found, skipping HTML validation.' unless tidy

    # Disconnect databases before forking parallel processes.
    DB.disconnect
    DASHBOARD_DB.disconnect

    results = Parallel.map(all_documents) do |page|
      site = page[:site]
      uri = page[:uri]

      # If this site isn't a live host, use an inherited site instead.
      unless live_host?(site)
        site = inherited_sites(site).select(&method(:live_host?)).last
      end

      url = "#{site}#{uri}"
      header 'host', site
      queries = []
      begin
        attempts = 3
        loop do
          queries = capture_queries(DB, DASHBOARD_DB) {get(uri)}
          break if queries.empty? || (attempts -= 1).zero?
        end
      rescue Exception => e
        # Filter backtrace from current location.
        index = e.backtrace.index(caller(2..2).first)
        e.set_backtrace(e.backtrace[0..index - 1])
        next "[#{url}] Render failed:\n#{e}\n#{e.backtrace.join("\n")}"
      end
      response = last_response
      status = response.status

      if status == 200
        content_type = response.headers['Content-Type'].split(';', 2).first.downcase
        if content_type == 'text/html'
          # Ensure HTML is valid.
          if tidy && (errors = validate(response.body))
            next "[#{url}] HTML validation failed:\n#{errors.join}"
          end
        else
          exceptions = CONTENT_TYPE_EXCEPTIONS[content_type] || []
          next "[#{url}] returned invalid Content-Type #{content_type}" unless exceptions.include?(url)
        end
      else
        exceptions = STATUS_EXCEPTIONS[status] || []
        next "[#{url}] returned invalid status #{status}" unless exceptions.include?(url)
      end
      {url => {body: response.body, queries: queries}}
    end
    errors, pages = results.partition {|result| result.is_a?(String)}
    assert_equal 0, errors.length, "Page rendering errors:\n#{errors.join("\n\n")}"

    pages = pages.reduce(:merge).sort.to_h
    query_pages = pages.reject {|_, p| p[:queries].empty?}.transform_values {|p| p[:queries]}
    assert_equal 0, query_pages.length, "Pages with un-cached DB queries:\n\n#{query_pages.map {|p| p.join(":\n")}.join("\n\n")}"
    pages = pages.transform_values {|p| p[:body]}

    routes_file = cache_dir('pegasus_routes.yml.gz')
    if File.exist?(routes_file)
      old_routes = YAML.safe_load(Zlib::GzipReader.new(File.open(routes_file)).read)
      diffs = (pages.to_a - old_routes.to_a).to_h.keys - CONTENT_CHANGE_EXCEPTIONS
      if diffs.any?
        diff_outputs = diffs.map do |diff|
          # Run test with `DIFF=1` to output line-by-line differences via `diff`.
          next diff unless ENV['DIFF']
          diff_output = Tempfile.open('a') do |a|
            Tempfile.open('b') do |b|
              File.write(a, old_routes[diff])
              File.write(b, pages[diff])
              `diff -wB #{a.path} #{b.path}`
            end
          end
          "---\n#{diff}:\n---\n#{diff_output}"
        end
        warn "Changed routes:\n\n#{diff_outputs.join("\n")}"
      end
    end
    if ENV['SAVE_DIFF']
      Zlib::GzipWriter.open(routes_file) {|gz| gz.write(YAML.dump(pages))}
      CDO.log.info "Saved rendered Pegasus routes to disk."
    end
  end

  private

  # @return [Array<String>] sites configured with the provided site as their 'base'.
  def inherited_sites(site)
    Documents.load_configs_in(app.helpers.content_dir).
      select {|_, config| config[:base] == site}.
      keys
  end

  # If a given host isn't 'live', it won't correctly render requests routed to it as expected.
  # @return [Boolean] whether the host matches the result returned by `request.site`.
  def live_host?(host)
    Rack::Request.new({'HTTP_HOST' => host}).site == host
  end

  # Runs `tidy` in a subprocess to validate HTML content.
  # @return [Array, nil] error messages, or `nil` if no errors.
  def validate(body)
    cmd = 'tidy -q -e'
    status, result = nil
    Open3.popen3(cmd) do |stdin, _stdout, stderr, wait_thread|
      stdin.puts body
      stdin.close
      result = stderr.read
      status = wait_thread.value.exitstatus
    end

    # Status codes:
    # 0 on successful validation
    # 1 if warnings are present
    # 2 if errors are present
    if status == 2
      result.lines.grep(/Error:/)
    end
  end
end
