# Brand configuration module that provides brand-specific assets and URLs.
# Uses DCDO flag as on/off switch and experiments (URL param > cookie > DCDO)
# to determine which brand to use, allowing per-user brand testing.
require_relative '../../shared/middleware/helpers/experiments'

module Cdo
  class Brand
    # Brand code enum
    BRAND_CODE_CODE_ORG = 'code'.freeze
    BRAND_CODE_CODEAI = 'codeai'.freeze

    # Brand configurations keyed by brand code
    BRANDS = {
      BRAND_CODE_CODE_ORG => {
        logo_filename: 'logo-inverse.svg',
        logo_alt_key: :code_org_logo_alt,
        favicon: 'favicon.ico',
        legal_name: 'Code.org',
        trademark_html: '&copy; Code.org, %{current_year}. Code.org&reg;, the CODE logo, Hour of Code&reg; and CS Discoveries&reg; are trademarks of Code.org.'
      },
      BRAND_CODE_CODEAI => {
        logo_filename: 'logo.svg',
        logo_alt_key: :code_org_logo_alt,
        favicon: 'favicon.ico',
        legal_name: 'Code.ai',
        trademark_html: '&copy; Code.ai, %{current_year}. Code.ai&reg;, the CODE logo, Hour of Code&reg; and CS Discoveries&reg; are trademarks of Code.ai.'
      }
    }.freeze

    # Get the current brand code.
    # First checks the DCDO boolean flag studio-brand-update-enabled.
    # If disabled, returns the default brand.
    # If enabled, uses experiment_value to check per-brand flags with priority:
    #   URL param > cookie > DCDO fallback
    # This allows per-user brand testing via e.g. ?studio-brand-codeai=1
    # On the frontend, the same keys are checked via experiments.isEnabled().
    # @param request [ActionDispatch::Request, nil] the current request (for URL param/cookie checks)
    def self.current_brand_code(request = nil)
      return BRAND_CODE_CODE_ORG unless DCDO.get('studio-brand-update-enabled', false)

      return BRAND_CODE_CODEAI if request && experiment_value("studio-brand-#{BRAND_CODE_CODEAI}", request)

      BRAND_CODE_CODE_ORG
    end

    # Get the current brand configuration
    # @param request [ActionDispatch::Request, nil] the current request
    def self.current_brand_configuration(request = nil)
      brand_code = current_brand_code(request)
      BRANDS[brand_code] || BRANDS[BRAND_CODE_CODE_ORG]
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
  end
end
