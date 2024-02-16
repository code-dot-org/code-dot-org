# This pre-seeds the Data Library from Firebase,
# including the datasets, and the library manifest.
#
# TODO: post-firebase-cleanup, remove this migration (=turn it into a NoOp)
# as soon as firebase is outdated, we shouldn't be running this anymore.
class SeedDatasetsFromFirebase < ActiveRecord::Migration[6.1]

  def up
    begin
      seed_manifest_from_firebase
      seed_tables_from_firebase
    rescue => e
      Rails.logger.warn <<~LOG
        Failed to seed datablock storage library from Firebase: #{e.message}
        This isn't an error, unless you really want to get the Firebase
        'Data Library' data. If its after June 2024, this code should have
        been removed, somebody forgot to do the `TODO: post-firebase-cleanup`.
      LOG
    end
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
    db.update!(library_manifest: firebase_manifest)
  end

  def seed_tables_from_firebase
    raise "There are already shared_tables / datasets, not re-seeding"
      unless DatablockStorageTable.get_shared_table_names.length < 1
    tables_json = firebase_get('/v3/channels/shared/storage/tables')
    DatablockStorageTable.populate_tables(DatablockStorageTable::SHARED_TABLE_PROJECT_ID, tables_json)
  end

end
