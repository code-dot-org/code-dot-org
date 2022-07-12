require 'json'

class Form2 < OpenStruct
  def initialize(params={})
    params = params.dup
    params[:data] = JSON.parse(params[:data])
    params[:processed_data] = JSON.parse(params[:processed_data])
    super params
  end

  def self.from_row(row)
    return nil unless row
    new row
  end
end
