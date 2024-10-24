# frozen_string_literal: true

require 'cdo/global_edition'

module GlobalEditionHelper
  def ge_region
    Cdo::GlobalEdition.current_region
  end
end
