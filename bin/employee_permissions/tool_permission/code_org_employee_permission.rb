class CodeOrgEmployeePermission
  def initialize(opts)
    @opts = opts
  end

  def id
    return @opts[:id]
  end

  def admin?
    return @opts[:is_admin]
  end

  def name
    return @opts[:name]
  end

  def email
    return @opts[:email]
  end

  def search_key
    return @opts[:search_key]
  end

  def remove(dry_run=false)
    raise "Not implemented"
  end

  def self.get_all_members_impl
    raise "Not implemented"
  end

  def self.get_all_members
    raw_members = get_all_members_impl
    members = []
    raw_members.each do |raw_member|
      new_member = new(raw_member)
      members << new_member
    end
    members
  end

  def self.get_member_from_search_key(search_key)
    results = []
    get_all_members.each do |member|
      if member.search_key == search_key
        results << member
      end
    end
    return results
  end
end
