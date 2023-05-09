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
end
