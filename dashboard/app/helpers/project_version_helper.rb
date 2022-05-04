module ProjectVersionHelper
  PROJECT_TTL = 1.year

  def version_expired?(version_date)
    version_date < (Date.today - PROJECT_TTL)
  end
end
