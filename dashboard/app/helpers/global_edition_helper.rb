# frozen_string_literal: true

module GlobalEditionHelper
  def ge_region
    cookies[Rack::GlobalEdition::REGION_KEY]
  end
end
