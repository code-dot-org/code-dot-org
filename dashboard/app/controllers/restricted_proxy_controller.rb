require 'net/http'

# Development-only workaround for serving CloudFront-restricted musiclab assets
# (e.g. /restricted/musiclab/library-launch2024/packs/.../foo.mp3) on a local
# box that has no real CloudFront signing keys.
#
# It proxies /restricted/* to an upstream (production) that owns the keys and
# assets, replaying cookies signed there. The signing/borrowing lives in
# AWS::CloudFront (see #dev_signing_override? / #upstream_signed_cookie_header),
# which the same-origin /dashboardapi/sign_cookies endpoint also uses; here we
# just attach those cookies and stream the asset back.
#
# Enabled ONLY under AWS::CloudFront.dev_signing_override? — development AND the
# `localoverride` key-pair sentinel. The route is likewise gated, so this is
# unreachable in any other environment; it must never act as an open proxy.
class RestrictedProxyController < ApplicationController
  def show
    return head(:not_found) unless self.class.enabled?

    upstream_response = get(
      URI.parse("#{upstream}#{request.fullpath}"),
      AWS::CloudFront.upstream_signed_cookie_header,
    )

    unless upstream_response.is_a?(Net::HTTPSuccess)
      return head(upstream_response.code.to_i)
    end

    send_data(
      upstream_response.body,
      type: upstream_response.content_type || 'application/octet-stream',
      disposition: 'inline',
    )
  end

  def self.enabled?
    AWS::CloudFront.dev_signing_override?
  end

  private def upstream
    (CDO[:restricted_proxy_upstream].presence ||
      AWS::CloudFront::DEV_SIGNING_UPSTREAM_DEFAULT).chomp('/')
  end

  private def get(uri, cookie_header)
    request = Net::HTTP::Get.new(uri)
    request['Cookie'] = cookie_header if cookie_header.present?
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      http.request(request)
    end
  end
end
