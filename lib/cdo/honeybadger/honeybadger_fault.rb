class HoneybadgerFault
  def initialize(fault)
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
end
