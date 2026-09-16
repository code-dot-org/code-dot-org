# Brand configuration module that provides brand-specific assets and URLs.
#
# DCDO keys:
#   default-brand         The brand code returned to all users when no per-user
#                         override applies. Defaults to BRAND_CODEAI_NEXT when
#                         unset or set to an unknown code; today that makes it
#                         a no-op (BRAND_CODEAI_NEXT is the only valid default),
#                         but the key is kept so a future brand can be rolled
#                         out or rolled back without a deploy.
#   brand-router-enabled  On/off switch for per-user routing. When off, every
#                         request gets the default-brand. When on, the brand is
#                         resolved per request: URL param > cookie > default.
#                         The only other brand the router can select is
#                         BRAND_CODEAI_AUDIT; this is its sole access mechanism.
#
# Per-user routing (when brand-router-enabled is on):
#   ?brand=codeai-audit → sets brand to codeai-audit and persists in cookie
#   ?brand-reset=1       → clears brand cookie, reverts to default
require_relative 'cookie_helpers'

module Cdo
  class Brand
    # Brand code enum
    #
    # BRAND_CODEAI_NEXT  Default branding. Carries the CADS color ramp
    #                    (component-library-styles/brandCodeAiNext.css).
    # BRAND_CODEAI_AUDIT Visual auditing tool: every DSCO semantic token
    #                    renders pink (brandCodeAiAudit.css) so surfaces that
    #                    bypass the token system stand out. Never a default;
    #                    reachable only via the brand router (see DCDO keys).
    BRAND_CODEAI_NEXT = 'codeai-next'.freeze
    BRAND_CODEAI_AUDIT = 'codeai-audit'.freeze

    # Base cookie name for brand persistence (env suffix added by environment_specific_cookie_name)
    BRAND_COOKIE_NAME = 'brand'.freeze

    # Asset config shared by both remaining brands: they share CodeAI's
    # identity assets, so one hash keeps them from drifting out of sync.
    CODEAI_ASSETS = {
      logo_filename: 'logo-codeai.svg',
      header_logo_filename: 'logo-codeai-inverse.svg',
      logo_alt_key: :codeai_logo_alt,
      # favicon-codeai.ico is derived from favicon-codeai.svg: rsvg-convert to a
      # 32x32 PNG, packed as a single-frame PNG-in-ICO. SVG is primary for modern
      # browsers; ICO is the legacy fallback.
      favicon: 'favicon-codeai.ico',
      favicon_svg: 'favicon-codeai.svg',
      legal_name: 'CodeAI',
      trademark_html: '&copy; CodeAI, %{current_year}. CodeAI&reg;, the CODE logo, Hour of Code&reg; and CS Discoveries&reg; are trademarks of CodeAI.'
    }.freeze

    # Brand configurations keyed by brand code
    BRANDS = {
      BRAND_CODEAI_NEXT => CODEAI_ASSETS,
      BRAND_CODEAI_AUDIT => CODEAI_ASSETS
    }.freeze

    # Get the current brand code.
    # When brand-router-enabled is off, always returns the default brand.
    # When on, checks URL param > cookie, falling back to the default brand.
    # The default brand is read from DCDO 'default-brand' and falls back to
    # BRAND_CODEAI_NEXT when unset, set to an unknown code, or set to
    # BRAND_CODEAI_AUDIT (which may only be reached via per-request override).
    # @param request [ActionDispatch::Request, nil] the current request
    def self.current_brand_code(request = nil)
      default = DCDO.get('default-brand', BRAND_CODEAI_NEXT)
      # BRAND_CODEAI_AUDIT is a per-request QA tool (see enum comment above)
      # and must never be reachable as the sitewide default.
      default = BRAND_CODEAI_NEXT unless BRANDS.key?(default) && default != BRAND_CODEAI_AUDIT

      return default unless DCDO.get('brand-router-enabled', false)

      brand = resolve_brand(request)
      BRANDS.key?(brand) ? brand : default
    end

    # True for codeai-next or its audit variant codeai-audit. Drives the
    # `html.nav-reskin` class (see application.html.haml).
    def self.codeai_next?(request = nil)
      [BRAND_CODEAI_NEXT, BRAND_CODEAI_AUDIT].include?(current_brand_code(request))
    end

    # Get the current brand configuration
    # @param request [ActionDispatch::Request, nil] the current request
    def self.current_brand_configuration(request = nil)
      BRANDS[current_brand_code(request)]
    end

    # Get the logo filename for the current brand (used on share pages)
    def self.logo_filename(request = nil)
      current_brand_configuration(request)[:logo_filename]
    end

    # Get the header logo filename for the current brand (used in the site header)
    def self.header_logo_filename(request = nil)
      current_brand_configuration(request)[:header_logo_filename]
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

    # Get the SVG favicon filename for the current brand, or nil if none configured
    def self.favicon_svg(request = nil)
      current_brand_configuration(request)[:favicon_svg]
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
    def self.marketing_url
      CDO.code_org_url
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
