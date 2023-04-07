class HoneybadgerFault
  def initialize(fault)
    @fault = fault
  end

  def environment
    @fault['environment'] || 'unknown'
  end

  def assignee
    @fault['assignee'] ? @fault['assignee']['email'] : nil
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

  def dotd_fault_response
    {
      environment: environment,
      assignee: assignee,
      url: url,
      message: message
    }
  end
end
