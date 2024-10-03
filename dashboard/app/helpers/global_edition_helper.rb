# frozen_string_literal: true

module GlobalEditionHelper
  def ge_region
    cookies[Rack::GlobalEdition::REGION_KEY]
  end

  def global_edition_region_switch_confirm_partial
    return unless Rack::GlobalEdition::TARGET_HOSTNAMES.include?(request.hostname)

    country_code = request.country_code
    ge_region = Rack::GlobalEdition::COUNTIES_REGIONS[country_code]
    return unless ge_region

    enabled_regions = DCDO.get('global_edition_region_switch_confirm_enabled_in', [])
    return unless enabled_regions.include?('all') || enabled_regions.include?(ge_region)

    render partial: 'global_edition/region_switch_confirm', locals: {
      country_code: country_code,
      region_data: {
        code: ge_region,
        name: I18n.t(ge_region, scope: 'global_edition.regions'),
        href: url_for(params.to_unsafe_h.merge(ge_region: ge_region)),
      },
    }
  end
end
