module JSON
  # safely parses a JSON string representing an Array, Object,
  # boolean, string or number.
  def self.from_json(str)
    JSON.parse("{\"value\":#{str}}")['value']
  end
end