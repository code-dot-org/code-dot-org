module CachedUnitHelper
  # Default s-maxage to use for script level pages which are configured as
  # publicly cacheable.  Used if the DCDO.public_proxy_max_age is not defined.
  DEFAULT_PUBLIC_PROXY_MAX_AGE = 3.minutes

  # Default max-age to use for script level pages which are configured as
  # publicly cacheable. Used if the DCDO.public_max_age is not defined.
  # This is set to twice the proxy max-age because of a bug in CloudFront.
  DEFAULT_PUBLIC_CLIENT_MAX_AGE = DEFAULT_PUBLIC_PROXY_MAX_AGE * 2

  def disable_session_for_cached_pages
    if cachable_request?(request)
      request.session_options[:skip] = true
    end
  end

  # Configure http caching for the given script. Caching is disabled unless the
  # Gatekeeper configuration for 'script' specifies that it is publicly
  # cachable, in which case the max-age and s-maxage headers are set based the
  # 'public-max-age' DCDO configuration value.  Because of a bug in Amazon Cloudfront,
  # we actually set max-age to twice the value of s-maxage, to avoid Cloudfront serving
  # stale content which has to be revalidated by the client. The details of the bug are
  # described here:
  # https://console.aws.amazon.com/support/home?region=us-east-1#/case/?caseId=1540449361&displayId=1540449361&language=en
  private def configure_caching(script)
    if script && ScriptConfig.allows_public_caching_for_script(script.name) &&
       !ScriptConfig.uncached_script_level_path?(request.path)
      max_age = DCDO.get('public_max_age', DEFAULT_PUBLIC_CLIENT_MAX_AGE)
      proxy_max_age = DCDO.get('public_proxy_max_age', DEFAULT_PUBLIC_PROXY_MAX_AGE)
      response.headers['Cache-Control'] = "public,max-age=#{max_age},s-maxage=#{proxy_max_age}"
      return true
    else
      prevent_caching
      return false
    end
  end
end
