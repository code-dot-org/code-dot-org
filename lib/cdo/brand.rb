# Brand configuration module that provides brand-specific assets and URLs.
# Uses DCDO flag 'brand-router-enabled' as on/off switch.
# When enabled, brand is resolved from URL param > cookie > default:
#   ?brand=codeai  → sets brand to codeai and persists in cookie
#   ?brand-reset=1 → clears brand cookie, reverts to default
require_relative 'cookie_helpers'

module Cdo
  class Brand
    # Brand code enum
    BRAND_CODE_ORG = 'code'.freeze
    BRAND_CODEAI = 'codeai'.freeze

    # Base cookie name for brand persistence (env suffix added by environment_specific_cookie_name)
    BRAND_COOKIE_NAME = 'brand'.freeze

    # Brand configurations keyed by brand code
    BRANDS = {
      BRAND_CODE_ORG => {
        logo_filename: 'logo-inverse.svg',
        logo_alt_key: :code_org_logo_alt,
        favicon: 'favicon.ico',
        legal_name: 'Code.org',
        trademark_html: '&copy; Code.org, %{current_year}. Code.org&reg;, the CODE logo, Hour of Code&reg; and CS Discoveries&reg; are trademarks of Code.org.'
      },
      BRAND_CODEAI => {
        logo_filename: 'logo.svg',
        logo_alt_key: :code_org_logo_alt,
        favicon: 'favicon.ico',
        legal_name: 'Code.ai',
        trademark_html: '&copy; Code.ai, %{current_year}. Code.ai&reg;, the CODE logo, Hour of Code&reg; and CS Discoveries&reg; are trademarks of Code.ai.'
      }
    }.freeze

    # Get the current brand code.
    # When brand-router-enabled is off, always returns default brand.
    # When enabled, checks URL param > cookie for brand code.
    # @param request [ActionDispatch::Request, nil] the current request
    def self.current_brand_code(request = nil)
      return BRAND_CODE_ORG unless DCDO.get('brand-router-enabled', false)

      brand = resolve_brand(request)
      BRANDS.key?(brand) ? brand : BRAND_CODE_ORG
    end

    # Get the current brand configuration
    # @param request [ActionDispatch::Request, nil] the current request
    def self.current_brand_configuration(request = nil)
      brand_code = current_brand_code(request)
      BRANDS[brand_code] || BRANDS[BRAND_CODE_ORG]
    end

    # Get the logo filename for the current brand
    def self.logo_filename(request = nil)
      current_brand_configuration(request)[:logo_filename]
    end

    # Get the I18n key for the logo alt text
    def self.logo_alt_key(request = nil)
      current_brand_configuration(request)[:logo_alt_key]
    end

    # Get the logo alt text using the global I18n module
    def self.logo_alt_text(request = nil)
      ::I18n.t(logo_alt_key(request))
    end

    # Get the favicon filename for the current brand
    def self.favicon(request = nil)
      current_brand_configuration(request)[:favicon]
    end

    # Get the legal name for the current brand (for copyright notices)
    def self.legal_name(request = nil)
      current_brand_configuration(request)[:legal_name]
    end

    # Get the trademark HTML for the current brand.
    # @return [String] HTML-safe trademark string with placeholders filled
    def self.trademark_html(request = nil)
      current_year = Time.now.year
      template = current_brand_configuration(request)[:trademark_html]
      html = format(template, current_year: current_year)
      ActionController::Base.helpers.sanitize(
        html,
        tags: %w[a br],
        attributes: %w[href]
      )
    end

    # Get the marketing URL for the current brand
    # @param ge_region [Symbol, nil] Optional global edition region
    # @return [String] Marketing URL
    def self.marketing_url(ge_region: nil)
      CDO.code_org_url('', '', ge_region: ge_region)
    end

    private_class_method def self.resolve_brand(request)
      return nil unless request

      # URL param takes priority
      brand = request.params['brand']
      return brand if brand.present?

      # Then env-specific cookie
      cookie_key = environment_specific_cookie_name(BRAND_COOKIE_NAME)
      request.cookies[cookie_key]
    end
  end
end
