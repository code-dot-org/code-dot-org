module DancePartyImageGenerator
  module Naming
    module_function def slug(text) = text.to_s.downcase.strip.gsub(/[^\w\- ]+/, "").gsub(/[ ]+/, "-")

    # item: {animal:, adj: (optional), attire: (optional), variant: Integer}
    module_function def base_name(item)
      i = item.symbolize_keys
      parts = []
      parts << slug(i[:animal])
      parts << slug(i[:attire]) if i[:attire].present?
      parts << slug(i[:adj])   if i[:adj].present?
      parts << format("%02d", Integer(i[:variant]))
      parts.join("-")
    end
  end
end
