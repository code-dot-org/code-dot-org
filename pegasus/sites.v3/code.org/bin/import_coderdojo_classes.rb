#!/usr/bin/env ruby
require_relative '../../../src/env'
require src_dir 'database'
require 'json'

def main()
  url = 'https://zen.coderdojo.com/api/codedotorg'
  resp = Net::HTTP.get_response(URI.parse(url))
  data = JSON.parse(resp.body)

  data.each do |i|
    insert_data(i)
  end
end

def insert_data(data)
  form = Form.new

  form.secret = SecureRandom.hex
  form.parent_id = nil
  form.user_id = nil
  form.email = 'anonymous@code.org'
  form.name = 'CoderDojo'
  form.kind = 'ClassSubmission'
  form.created_ip = form.updated_ip = '66.175.209.200'

  data['source_id_s'] = form.source_id = 'coderdojo:' + data['id']
  data.delete('id')

  form.data = data

  raise ValidationError.new(form) unless form.save

  data
end

main if only_one_running?(__FILE__)
