def save_locally(filename, content)
  save_dir = "./saved_sources"
  Dir.mkdir(save_dir) unless Dir.exist?(save_dir)
  filepath = File.join(save_dir, filename)
  File.write(filepath, content)
end

ActiveRecord::Base.logger = Logger.new(STDOUT)

#sample_size = 1000
#last_active_after = 90.days.ago
project_type = "applab"
block_type = "onRecordEvent"

s3_path_prefix = Rails.env=="production" ? "sources" : "sources_development"
s3_bucket = "cdo-v3-sources"

total_projects = 0
projects_contain_block = 0

starting_project_ids = (0..52).map { |week| (week * 4000000) + 556000000 }

starting_project_ids.each do |starting_project_id|
  batch_size = 200
  sample_size = 2000

  batches = [Project.where(
    project_type: project_type, 
    #updated_at: last_active_after...,
    #id: 930000000...
    id: starting_project_id...,
  )
    .limit(sample_size)]
    #.find_in_batches(batch_size: batch_size)
  puts "Starting sample of #{sample_size} at project_id #{starting_project_id}".red
  batches.each do |projects|
    puts "Starting batch"
    projects.each do |project|
      s3_path = "#{s3_path_prefix}/#{project.storage_id}/#{project.id}/main.json"

      begin
        file_contents = AWS::S3.download_from_bucket(s3_bucket, s3_path)
      rescue
        puts "Couldn't download #{s3_path}, #{project.state}"
      else
        total_projects += 1
        source_code = JSON.parse(file_contents)["source"]
        contains_block = source_code.include?("#{block_type}(")
        if !source_code.is_a? String
          raise "Source code is not a string, #{source_code}"
        end
              
        if rand() > 0.99
          puts "Project #{project.id}, created: #{project.created_at}, updated: #{project.updated_at}"
          # puts "#{source_code}"
        end

        if contains_block
          save_locally("#{project.id}.json", source_code)
          projects_contain_block += 1
          puts
          puts
          puts
          puts
          puts "onRecordEvent FOUND in #{project.id}, created: #{project.created_at}, updated: #{project.updated_at}".green
          puts
          puts
          puts
          puts
          puts
          puts
        end
      end
    end

    percent_using_block = (projects_contain_block.to_f / total_projects) * 100
    puts "Percentage of #{project_type} projects using the #{block_type} block is #{percent_using_block}, #{projects_contain_block} out of #{total_projects}".magenta
  end
end