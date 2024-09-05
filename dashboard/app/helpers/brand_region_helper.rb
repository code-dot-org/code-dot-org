module BrandRegionHelper
  def current_brand_region
    params[:brand_region] || "global"
  end

  def current_brand_region_feature_exclusion_map
    SHARED_CONSTANTS::BRAND_REGION_FEATURE_EXCLUSION_MAP[current_brand_region] || {}
  end

  def current_brand_region_has_feature(feature)
    context = current_brand_region_feature_exclusion_map
    features.split(".").each do |part|
      context = context[part] || {}
    end
    context = true if context.nil?
    !!context
  end
end
