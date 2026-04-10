#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require "open3"
require "uri"

load File.expand_path("../bin/wait-for-200", __dir__)

class FakeDnsClient
  attr_reader :queries

  def initialize(results: {}, errors: {})
    @results = normalize_map(results)
    @errors = normalize_map(errors)
    @queries = []
  end

  def resources(nameserver:, host:, typeclass:)
    key = [nameserver, host, type_key(typeclass)]
    @queries << key

    error = @errors[key]
    raise error if error

    Array(@results.fetch(key, [])).dup
  end

  private def normalize_map(map)
    map.each_with_object({}) do |(key, value), normalized|
      nameserver, host, type = key
      normalized[[nameserver, host, type.to_s]] = value
    end
  end

  private def type_key(typeclass)
    case typeclass.name
    when Resolv::DNS::Resource::IN::NS.name
      "NS"
    when Resolv::DNS::Resource::IN::A.name
      "A"
    when Resolv::DNS::Resource::IN::AAAA.name
      "AAAA"
    else
      typeclass.name
    end
  end
end

class FakeHttpResponse
  def initialize(code:, headers: {})
    @code = code
    @headers = headers
  end

  attr_reader :code

  def [](key)
    @headers[key]
  end
end

class FakeHttpClient
  attr_reader :requests

  def initialize(results:)
    @results = results
    @requests = []
  end

  def get(uri:, ip_address:)
    @requests << [uri.to_s, ip_address]

    result = @results.fetch([uri.to_s, ip_address]) do
      raise "unexpected request: #{uri} via #{ip_address}"
    end
    raise result if result.is_a?(Exception)

    result
  end
end

class WaitFor200Test < Minitest::Test
  CLOUDFLARE = WaitFor200::CLOUDFLARE_DNS
  GOOGLE = WaitFor200::GOOGLE_DNS

  def test_succeeds_despite_stale_recursive_dns_and_partial_authoritative_failure
    host = "dex.k8s.code.org"
    dns = FakeDnsClient.new(
      results: {
        [GOOGLE, "k8s.code.org", "NS"] => ["ns-one.awsdns.test", "ns-two.awsdns.test"],
        [GOOGLE, "ns-one.awsdns.test", "A"] => ["192.0.2.10"],
        [GOOGLE, "ns-two.awsdns.test", "A"] => ["192.0.2.11"],
        ["192.0.2.11", host, "A"] => ["203.0.113.20"],
        [GOOGLE, host, "A"] => ["203.0.113.21"],
      },
      errors: {
        [CLOUDFLARE, "k8s.code.org", "NS"] => Resolv::ResolvError.new("stale NXDOMAIN"),
        ["192.0.2.10", host, "A"] => StandardError.new("timed out"),
      },
    )
    http = FakeHttpClient.new(
      results: {
        ["https://#{host}/", "203.0.113.20"] => StandardError.new("connection refused"),
        ["https://#{host}/", "203.0.113.21"] => FakeHttpResponse.new(code: "200"),
      },
    )

    checker = checker(dns: dns, http: http)

    checker.fetch(URI("https://#{host}/"))

    assert_includes dns.queries, [CLOUDFLARE, "k8s.code.org", "NS"]
    assert_includes dns.queries, [GOOGLE, "k8s.code.org", "NS"]
    assert_equal [
      ["https://#{host}/", "203.0.113.20"],
      ["https://#{host}/", "203.0.113.21"],
    ], http.requests
  end

  def test_redirect_reruns_dns_resolution_for_the_redirected_host
    source_host = "dex.k8s.code.org"
    redirected_host = "argocd.k8s.code.org"
    dns = FakeDnsClient.new(
      results: {
        [CLOUDFLARE, "k8s.code.org", "NS"] => ["ns-one.awsdns.test"],
        [CLOUDFLARE, "ns-one.awsdns.test", "A"] => ["192.0.2.50"],
        ["192.0.2.50", source_host, "A"] => ["203.0.113.50"],
        ["192.0.2.50", redirected_host, "A"] => ["203.0.113.51"],
      },
    )
    http = FakeHttpClient.new(
      results: {
        ["https://#{source_host}/", "203.0.113.50"] => FakeHttpResponse.new(
          code: "302",
          headers: {"location" => "https://#{redirected_host}/ready"},
        ),
        ["https://#{redirected_host}/ready", "203.0.113.51"] => FakeHttpResponse.new(code: "200"),
      },
    )

    checker = checker(dns: dns, http: http)

    checker.fetch(URI("https://#{source_host}/"))

    assert_includes dns.queries, ["192.0.2.50", redirected_host, "A"]
    assert_equal [
      ["https://#{source_host}/", "203.0.113.50"],
      ["https://#{redirected_host}/ready", "203.0.113.51"],
    ], http.requests
  end

  def test_fails_with_useful_error_when_no_dns_path_yields_an_endpoint
    host = "dex.k8s.code.org"
    dns = FakeDnsClient.new(
      errors: {
        [CLOUDFLARE, "k8s.code.org", "NS"] => Resolv::ResolvError.new("stale NXDOMAIN"),
        [GOOGLE, "k8s.code.org", "NS"] => Resolv::ResolvError.new("SERVFAIL"),
      },
    )
    http = FakeHttpClient.new(results: {})

    error = assert_raises(WaitFor200::AttemptFailed) do
      checker(dns: dns, http: http).fetch(URI("https://#{host}/"))
    end

    assert_includes error.message, "stale NXDOMAIN"
    assert_includes error.message, "SERVFAIL"
    assert_includes error.message, "no authoritative nameservers found for #{host}"
    assert_includes error.message, "no authoritative endpoint IPs found for #{host}"
    assert_empty http.requests
  end

  def test_prefers_ipv4_authoritative_nameserver_ips_when_both_families_exist
    host = "dex.k8s.code.org"
    dns = FakeDnsClient.new(
      results: {
        [CLOUDFLARE, "k8s.code.org", "NS"] => ["ns-one.awsdns.test"],
        [CLOUDFLARE, "ns-one.awsdns.test", "A"] => ["192.0.2.50"],
        [CLOUDFLARE, "ns-one.awsdns.test", "AAAA"] => ["2001:db8::50"],
        ["192.0.2.50", host, "A"] => ["203.0.113.50"],
      },
      errors: {
        ["2001:db8::50", host, "A"] => StandardError.new("ipv6 should not be queried"),
      },
    )

    ips, errors = WaitFor200::Resolver.new(dns_client: dns).endpoint_ip_addresses(host)

    assert_equal ["203.0.113.50"], ips
    refute_includes errors.join(" "), "ipv6 should not be queried"
  end

  def test_smoke_fetches_studio_code_org
    stdout, stderr, status = Open3.capture3(
      File.expand_path("../bin/wait-for-200", __dir__),
      "--timeout-seconds", "30",
      "https://studio.code.org",
    )

    assert status.success?, stderr + stdout
    assert_includes stdout, "https://studio.code.org returned 200"
  end

  private def checker(dns:, http:)
    WaitFor200::Checker.new(
      resolver: WaitFor200::Resolver.new(dns_client: dns),
      http_client: http,
    )
  end
end
