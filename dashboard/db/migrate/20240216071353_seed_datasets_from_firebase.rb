# This pre-seeds the Data Library from Firebase,
# including the datasets, and the library manifest.
#
# TODO: post-firebase-cleanup, remove this migration (=turn it into a NoOp)
# as soon as firebase is outdated, we shouldn't be running this anymore.
class SeedDatasetsFromFirebase < ActiveRecord::Migration[6.1]

  def up
    seed_manifest_from_firebase
    seed_tables_from_firebase
  rescue => e
    message = <<~LOG
      Failed to seed datablock storage library from Firebase: #{e.message}

      Traceback:
      #{e.backtrace.join("\n")}

      This isn't necessarily an error, unless you really want to get the Firebase
      'Data Library' data. If its after June 2024, this code should have
      been removed, somebody forgot to do the `TODO: post-firebase-cleanup`.
    LOG
    Rails.logger.warn message
    puts message
  end

  def down
    DatablockStorageLibraryManifest.instance.destroy
    DatablockStorageTable.where(project_id: DatablockStorageTable::SHARED_TABLE_PROJECT_ID).destroy_all
  end

private

  def firebase_get(path)
    raise "CDO.firebase_shared_secret not defined" unless CDO.firebase_shared_secret
    firebase = Firebase::Client.new 'https://cdo-v3-shared.firebaseio.com/', CDO.firebase_shared_secret
    response = firebase.get(path)
    raise "Error fetching #{path} from Firebase: #{response.code}" unless response.success?
    response.body
  end

  def seed_manifest_from_firebase
    db = DatablockStorageLibraryManifest.instance
    raise "Library manifest already exists, not re-seeding" unless db.library_manifest['tables']&.length < 1
    firebase_manifest = firebase_get('/v3/channels/shared/metadata/manifest')
    puts "Seeding library manifest from Firebase with #{firebase_manifest['tables']&.length} shared tables"
    db.update!(library_manifest: firebase_manifest)
  end

  def seed_tables_from_firebase
    raise "There are already shared_tables / datasets, not re-seeding" unless DatablockStorageTable.get_shared_table_names.length < 1
    firebase_tables = firebase_get('/v3/channels/shared/storage/tables')
    # Firebase's JSON format is a little different, in particular in stores
    # each record not as a JSON object, but as a JSON string
    firebase_tables.each do |table_name, firebase_table|
      table = firebase_table['records'].filter_map { |record| JSON.parse(record) if record.is_a?(String) }
      puts "Seeding shared table from Firebase: '#{table_name}' (#{table.length} records)"
      DatablockStorageTable.populate_tables(DatablockStorageTable::SHARED_TABLE_PROJECT_ID, {table_name => table})
    end
  end

end
