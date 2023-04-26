class HoneybadgerUrlParser
  QUERY_SEPARATOR = '%20'.freeze
  def initialize
    @filters = {}
  end

  def get_faults_url(project_id)
    query = get_url_query
    "/v2/projects/#{project_id}/faults?#{query}"
  end

  def set_filter(attribute_name, attribute_value)
    if !attribute_value.nil? && attribute_value.to_bool.nil?
      raise "Only nil or boolean values can be accepted"
    end
    @filters[:attribute_name] = attribute_value
  end

  def get_url_query
    # is:resolved%20-is:paused%20-is:ignored"
    filters_parsed = []
    @filters.each do |name, value|
      unless value.nil?
        filters_parsed << "#{value ? '' : '-'}#{name}".sub('_', ':')
      end
    end
    return filters_parsed.join(QUERY_SEPARATOR)
  end

  def set_is_paused(value)
    set_filter(:is_paused, value)
  end

  def set_is_resolved(value)
    set_filter(:is_resolved,  value)
  end

  def set_is_gnored(value)
    set_filter(:is_ignored, value)
  end

  def set_environment(value)
  end
end
