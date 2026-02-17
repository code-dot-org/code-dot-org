# Brand configuration module that provides brand-specific assets and URLs
# Uses DCDO flag to determine which brand to use
module Cdo
  class Brand
    # Brand configurations
    BRANDS = {
      'code.org' => {
        logo: 'logo-inverse.svg',
        logo_alt_key: :code_org_logo_alt,
        favicon: 'favicon.ico',
        marketing_url_method: :code_org_url
      },
    }.freeze

    # Get the current brand name from DCDO flag
    # Defaults to 'code' if flag is not set
    def self.current_brand_name
      DCDO.get('studio_brand_name', 'code.org')
    end

    # Get the current brand configuration
    def self.current_brand
      brand_name = current_brand_name
      BRANDS[brand_name] || BRANDS['code.org']
    end

    # Get the logo filename for the current brand
    def self.logo
      current_brand[:logo]
    end

    # Get the I18n key for the logo alt text
    def self.logo_alt_key
      current_brand[:logo_alt_key]
    end

    # Get the logo alt text using the global I18n module
    def self.logo_alt_text
      ::I18n.t(logo_alt_key)
    end

    # Get the favicon filename for the current brand
    def self.favicon
      current_brand[:favicon]
    end

    # Get the marketing URL for the current brand
    # @param ge_region [Symbol, nil] Optional global edition region
    # @return [String] Marketing URL
    def self.marketing_url(ge_region: nil)
      method_name = current_brand[:marketing_url_method]
      CDO.send(method_name, '', '', ge_region: ge_region)
    end
  end
end
