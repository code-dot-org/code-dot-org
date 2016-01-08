# Owns uploading/downloading packages to s3
PACKAGE_DIR = 'cdo-build-package'

class BuildPackage
  def self.has_package?(package_name, commit_hash)
    # puts "aws s3 ls s3://#{PACKAGE_DIR}/#{package_name}/#{commit_hash}"
    ls = `aws s3 ls s3://#{PACKAGE_DIR}/#{package_name}/#{commit_hash}`
    # puts ls
    !Regexp.new(commit_hash).match(ls).nil?
  end
end
