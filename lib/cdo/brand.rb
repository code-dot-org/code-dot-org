# Brand configuration module that provides brand-specific assets and URLs
# Uses DCDO flag to determine which brand to use
module Cdo
  class Brand
    # Brand code enum
    BRAND_CODE_CODE_ORG = 'code'.freeze
    BRAND_CODE_CODE_ORG_UPD = 'codeUpd'.freeze

    # Brand configurations keyed by brand code
    BRANDS = {
      BRAND_CODE_CODE_ORG => {
        logo_filename: 'logo-inverse.svg',
        logo_alt_key: :code_org_logo_alt,
        favicon: 'favicon.ico',
        legal_name: 'Code.org'
      },
      BRAND_CODE_CODE_ORG_UPD => {
        logo_filename: 'logo.svg',
        logo_alt_key: :code_org_logo_alt,
        favicon: 'favicon.ico',
        legal_name: 'Code.org'
      }
    }.freeze

    # Get the current brand code from DCDO flag
    # Uses boolean DCDO flag to determine brand code
    # Defaults to 'code' if flag is not set
    def self.current_brand_code
      DCDO.get('studio-brand-update-enabled', false) ? BRAND_CODE_CODE_ORG_UPD : BRAND_CODE_CODE_ORG
    end

    # Get the current brand configuration
    def self.current_brand_configuration
      brand_code = current_brand_code
      BRANDS[brand_code] || BRANDS[BRAND_CODE_CODE]
    end

    # Get the logo filename for the current brand
    def self.logo_filename
      current_brand_configuration[:logo_filename]
    end

    # Get the I18n key for the logo alt text
    def self.logo_alt_key
      current_brand_configuration[:logo_alt_key]
    end

    # Get the logo alt text using the global I18n module
    def self.logo_alt_text
      ::I18n.t(logo_alt_key)
    end

    # Get the favicon filename for the current brand
    def self.favicon
      current_brand_configuration[:favicon]
    end

    # Get the legal name for the current brand (for copyright notices)
    def self.legal_name
      current_brand_configuration[:legal_name]
    end

    # Get the marketing URL for the current brand
    # @param ge_region [Symbol, nil] Optional global edition region
    # @return [String] Marketing URL
    def self.marketing_url(ge_region: nil)
      CDO.code_org_url('', '', ge_region: ge_region)
    end
  end
end
