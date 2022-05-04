module ProjectVersionHelper
  # We delete old versions after one year, unless they are the current version
  # See https://s3.console.aws.amazon.com/s3/management/cdo-v3-sources/lifecycle/
  PROJECT_TTL = 1.year

  def version_expired?(version_date)
    version_date < (Date.today - PROJECT_TTL)
  end
end
