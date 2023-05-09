class HoneybadgerFault
  @affected_users = nil
  def initialize(honeybadger_url_builder, fault)
    @honeybadger_url_builder = honeybadger_url_builder
    @fault = fault
  end

  def environment
    @fault['environment'] || 'unknown'
  end

  def assignee(default=nil)
    @fault['assignee'] ? @fault['assignee']['email'] : default
  end

  def url
    @fault['url']
  end

  def id
    @fault['id']
  end

  def message
    @fault['message']
  end

  def project_id
    @fault['project_id']
  end

  def notices_within_range
    @fault['notices_count_in_range']
  end

  # Use this for debugging, if you need to access an attribute
  # Expose an access method for it
  def raw_fault
    @fault
  end

  def get_affected_users
    unless @affected_users.nil?
      return @affected_users
    end
    @affected_users = @honeybadger_url_builder.get_api_response("affected_users", {fault: self})
    return @affected_users
  end
end
