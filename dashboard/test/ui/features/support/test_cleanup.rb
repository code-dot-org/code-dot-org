module TestCleanup
  def track_record_for_deletion(model_name, record_id)
    @records_to_delete ||= {}
    @records_to_delete[model_name] ||= []
    @records_to_delete[model_name] << record_id
  end

  def clean_up_records
    return unless @records_to_delete&.any?
    require_rails_env

    @records_to_delete.each do |model_name, ids|
      model = model_name.constantize
      model.where(id: ids).destroy_all
      puts "Deleted #{ids.size} records from #{model_name} #{ids.join(', ')}"
    end
    @records_to_delete.clear
  end
end

World(TestCleanup)
