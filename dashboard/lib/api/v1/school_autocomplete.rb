require 'cdo/shared_cache'
class Api::V1::SchoolAutocomplete < AutocompleteHelper
  def self.get_zip_matches(zip)
    rows = School.where(zip: zip.to_s)
    # For private schools, we don't yet have a way to determine inactive schools so we consider all active.
    # For public & charter schools, we include only open schools as determined by nces 'status' (see
    # school.rb for OPEN_SCHOOL_STATUSES logic) to prevent showing duplicate/inactive schools to the user.
    current_import_year = CDO.shared_cache.read('current_nces_import_year') if CDO.shared_cache.exist?('current_nces_import_year')
    if current_import_year.nil?
      current_import_year = School.maximum(:last_known_school_year_open)
      CDO.shared_cache.write('current_nces_import_year', current_import_year)
    end
    rows = rows.where("school_type = 'private' OR last_known_school_year_open = '#{current_import_year}'")
    return rows.map do |row|
      Serializer.new(row).attributes
    end
  end

  # Determines if we should perform a search by ZIP code rather than by school
  # name or city.
  # @param query [String] the user-define query string
  # @return [boolean] true if it might be a ZIP, false otherwise
  def self.search_by_zip?(query)
    return !!(query =~ /^(\d{,5}|(\d{5}-\d{,4}))$/)
  end

  # JSON serializer used by get_zip_matches.
  class Serializer < ActiveModel::Serializer
    attributes :nces_id, :name, :city, :state, :zip, :school_type, :latitude, :longitude, :last_known_school_year_open

    def nces_id
      object.id.to_s
    end

    def name
      object.name.titleize
    end

    def city
      object.city.titleize
    end
  end
end
