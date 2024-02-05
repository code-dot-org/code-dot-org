require 'json'

class Form2 < OpenStruct
  def initialize(params = {})
    params = params.dup
    params[:data] = JSON.parse(params[:data]) if params[:data].present?
    params[:processed_data] = JSON.parse(params[:processed_data]) if params[:processed_data].present?
    super params
  end

  def self.from_row(row)
    return nil unless row
    new row
  end
end
