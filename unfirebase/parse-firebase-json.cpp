// clang-format off
#include <assert.h>
#include <rapidjson/filereadstream.h>
#include <rapidjson/istreamwrapper.h>
#include <rapidjson/reader.h>
#include <rapidjson/stringbuffer.h>
#include <rapidjson/writer.h>
#include <unistd.h>

#include <boost/atomic.hpp>
#include <boost/lockfree/queue.hpp>
#include <boost/lockfree/spsc_queue.hpp>
#include <boost/thread/thread.hpp>
#include <chrono>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <mutex>
#include <string>
#include <thread>

// We're using the ancient JDBC C++ api, because the new X DevAPI
// requires the X Plugin to be enabled on the MySQL server, and
// AWS RDS explicitly does not support that :-( Also, its not
// enabled by default in MySQL 5.7 anyway, so ... whatevs
//
// Docs on the old API are here:
// https://dev.mysql.com/doc/dev/connector-cpp/latest/jdbc_ref.html
#include <mysql/jdbc.h>

using namespace std;
using namespace rapidjson;

const char *getEnv(string envVar, const char *defaultVal) {
  const char *env = getenv(envVar.c_str());
  return env ? env : defaultVal;
}

const string DB_NAME = getEnv("MYSQL_DB", "unfirebase");
const string TABLE_NAME = getEnv("MYSQL_TABLE", "unfirebase");

thread_local sql::Connection *db = nullptr;
sql::Driver *driver = nullptr;

sql::Connection *getDB() {
  //  get_driver_instance(), is not thread-safe. Either avoid invoking these
  //  methods from within multiple threads at once, or surround the calls with
  //  a mutex to prevent simultaneous execution in multiple threads.
  //
  // TODO: make this thread-safe if we can't share driver between threads
  // we might be OK since we initialize this in the main thread and its NOT thread_local atm
  if (!driver) {
    driver = sql::mysql::get_driver_instance();
  }

  sql::ConnectOptionsMap options;
  options["hostName"] = getEnv("MYSQL_HOST", "localhost");
  options["userName"] = getEnv("MYSQL_USER", "root");
  options["password"] = getEnv("MYSQL_PWD", "root");
  options["port"] = atoi(getEnv("MYSQL_TCP_PORT", "3306"));
  options["OPT_LOCAL_INFILE"] = 1;

  return driver->connect(options);
}



const bool RAW_DEBUG = false;
const bool FINE_DEBUG = false;
const bool USE_WRITER_TO_COLLECT_STRING = true;
const bool LOAD_DATA_INSTEAD_OF_INSERT = true;
const bool LOAD_DATA_IN_THREAD = true;
const uint NUM_DATA_THREADS = 4;

const uint MAX_DEPTH = 256;
uint depth = 0;

std::vector<string> lastKeys = std::vector<string>(MAX_DEPTH);
string lastKey = "";
/*
{ // 1
  "v3": { // 2
    "channels": { // 3
      "---1Rrv7nSwJUPJUPJUPu17eaVLKSPAmrsaskdjs": { // 4
        "counters": {
          // SNIP
        },
        "metadata": { // 5
          "tables": { // 6
            "Words": { // 7
              "columns": { // 8
                "-Mw7ENQAzsRcOgwGNAXI": { // 9
                  "columnName": "id"
                },
                "-Mw7ENQB6uKfQYc0kI8U": {
                  "columnName": "Word"
                },
                // SNIP
              }
            }
          }
        },
        "serverTime": 1645110723499,
        "storage": { // 5
          "tables": { // 6
            "Words": { // 7
              "records": { // 8
                "1": "{\"id\":1,\"Word\":\"the\",\"Part of
Speech\":\"article\",\"Per Million Words\":48974.7,\" Length\":3.0}", "10":
"{\"id\":10,\"Word\":\"it\",\"Part of Speech\":\"pronoun\",\"Per Million
Words\":8605.5,\" Length\":2.0}",
                // SNIP
              }
            }
          }
        }
      }
    }
  }
}
*/

const int CHANNELS_DEPTH = 3;
const std::string CHANNELS_TOKEN = "channels";

const int CHANNEL_DEPTH = 4;

const int RECORDS_DEPTH = 7;
const std::string RECORDS_TOKEN = "records";

const int TABLE_NAME_DEPTH = 6;

const string NO_CHANNEL = "";
string currentChannelName = NO_CHANNEL;

StringBuffer *writerBuffer = nullptr;
Writer<StringBuffer> *writer = nullptr;
ofstream *loadDataBufferTSV = nullptr;
string loadDataBufferTSVFilename = "";
string loadDataBufferDir = "";

void startChannel(string channelName) {
  assert(currentChannelName == NO_CHANNEL);

  if (FINE_DEBUG) cout << "START CHANNEL " << channelName << endl;
  currentChannelName = channelName;

  if (USE_WRITER_TO_COLLECT_STRING) {
    writerBuffer = new StringBuffer();
    writer = new Writer<StringBuffer>(*writerBuffer);
  }
}

// "INSERT INTO unfirebase VALUES (?, ?)"
sql::PreparedStatement *insertUnfirebaseStatement = nullptr;
uint64_t unComittedRecords = 0;
uint64_t totalRecordsCount = 992000;
atomic<uint64_t> numRecordBytes {0};
uint64_t originalJSONBytes = 0;
std::mutex numRecordBytesMutex;

chrono::system_clock::time_point bandwidthStartClock;
bool bandwidthStartClockInitialized = false;
uint64_t bandwidthStartNumRecordBytes = 0;
double bandwidthSamplingDurationTarget = 5000.0f /* seconds, start small for first sample */;
const uint64_t NUMBER_OF_RECORDS_BEFORE_COMMIT = 1000;

boost::lockfree::queue<char *, boost::lockfree::capacity<NUM_DATA_THREADS * 2>> loadDataFilenameQueue;
std::atomic<uint64_t> numDataJobsQueued{0};

void loadData(string tsvFilename) {
  std::unique_ptr<sql::Statement> stmt(db->createStatement());
  numRecordBytesMutex.lock();
  cout << "LOAD DATA LOCAL INFILE '" << tsvFilename << "'" << endl;
  numRecordBytesMutex.unlock();
  stmt->execute("LOAD DATA LOCAL INFILE '" + tsvFilename +
                "' INTO TABLE `" + TABLE_NAME + "` FIELDS TERMINATED BY '\t' LINES "
                "TERMINATED BY '\n';");
  stmt->execute("COMMIT;");

  numRecordBytesMutex.lock();
  numRecordBytes += std::filesystem::file_size(tsvFilename);
  double percent = (round(100 * 100 * numRecordBytes / (double)originalJSONBytes) / 100);
  cout << "Written to MySQL: "
    << "\033[1m"
    << (round(numRecordBytes / (1000000000.0) * 100) / 100)
    << "GB"
    << "\033[0m"
    << ", \033[1;32m"
    << "~" << percent << "%\033[0m" << endl;
  
  numRecordBytesMutex.unlock();

  std::filesystem::remove(tsvFilename);
}

boost::atomic<bool> done(false);
void loadDataThread() {
  db = getDB();

  std::unique_ptr<sql::Statement> stmt(db->createStatement());
  db->setSchema(DB_NAME);

  cout << "loadDataThread: starting" << endl;
  char *tsvFilename;
  while (!done) {
    while (loadDataFilenameQueue.pop(tsvFilename)) {
      loadData(tsvFilename);
      numDataJobsQueued--;
      delete tsvFilename;
    }
  }

  cout << "loadDataThread: done=true, draining queue" << endl;

  while (loadDataFilenameQueue.pop(tsvFilename)) {
    loadData(tsvFilename);
    cout << "Num data jobs queued: " << numDataJobsQueued-- << endl;
    delete tsvFilename;
  }

  delete db;
  cout << "loadDataThread: done" << endl;
}

void resetBandwidthTiming() {
  bandwidthStartClockInitialized = true;
  bandwidthStartClock = std::chrono::system_clock::now();
  bandwidthStartNumRecordBytes = numRecordBytes;
}
void printBandWidthTiming() {
  if (!bandwidthStartClockInitialized) {
    return resetBandwidthTiming();
  }

  double bandwidthSamplingDuration = chrono::duration_cast<chrono::milliseconds>(chrono::system_clock::now() - bandwidthStartClock).count();
  if (bandwidthSamplingDuration > bandwidthSamplingDurationTarget /* ms*/) {
    bandwidthSamplingDurationTarget = 20000.0f;
    numRecordBytesMutex.lock();
    uint64_t bytesTransferred = numRecordBytes - bandwidthStartNumRecordBytes;
    double bytesPerSecond = bytesTransferred / (bandwidthSamplingDuration / 1000.0f);
    cout << "Current Bandwidth: "
      << "\033[1;35m"
      << (round(bytesPerSecond / (1000000.0) * 100) / 100)
      << "MB/s"
      << "\033[0m"
      << endl;
    
    // reset our start values for the next measure interval
    resetBandwidthTiming();
    numRecordBytesMutex.unlock();
  };
}

void commitRecords() {
  if (LOAD_DATA_INSTEAD_OF_INSERT) {
    if (LOAD_DATA_IN_THREAD) {
      // we're using threads, but we're not in one, just queue it up
      char *filename = strdup(loadDataBufferTSVFilename.c_str());
      while (!loadDataFilenameQueue.push(filename));
      cout << "Num data jobs queued: " << numDataJobsQueued++ << endl;
    } else {
      loadData(loadDataBufferTSVFilename);
    }
    delete loadDataBufferTSV;
    loadDataBufferTSV = nullptr;
  } else {
    std::unique_ptr<sql::Statement> stmt(db->createStatement());
    cout << "COMMITTING!" << endl;
    stmt->execute("COMMIT;");
  }
  printBandWidthTiming();
  unComittedRecords = 0;
}

inline void insertIntoFirebase(string &channelId, const char *value) {
  unComittedRecords++;

  if (LOAD_DATA_INSTEAD_OF_INSERT) {
    if (!loadDataBufferTSV) {
      //string shortFilename = filesystem::path(filename).filename();
      loadDataBufferTSVFilename = loadDataBufferDir + to_string(totalRecordsCount) + ".tsv";
      loadDataBufferTSV = new ofstream(loadDataBufferTSVFilename);
    }
    *loadDataBufferTSV << channelId << "\t" << value << endl;
  } else {
    numRecordBytes += strlen(value);
    insertUnfirebaseStatement->setString(1, currentChannelName);
    insertUnfirebaseStatement->setString(2, value);
    insertUnfirebaseStatement->execute();
  }

  totalRecordsCount++;

  if (unComittedRecords >= NUMBER_OF_RECORDS_BEFORE_COMMIT) {
    commitRecords();
  }
}

void endChannel() {
  assert(currentChannelName != NO_CHANNEL);

  if (writer) {
    insertIntoFirebase(currentChannelName, writerBuffer->GetString());
    delete writer;
    delete writerBuffer;
    writer = nullptr;
    writerBuffer = nullptr;
  } else {
    insertIntoFirebase(currentChannelName, "{ 'FAKE': 'DATA IS FAKE'}");
  }

  if (FINE_DEBUG) cout << "END CHANNEL " << currentChannelName << endl;
  currentChannelName = NO_CHANNEL;
}

void startTable(string tableName) {
  if (FINE_DEBUG) cout << "START TABLE " << tableName << endl;
}

void endTable() {
  if (FINE_DEBUG) cout << "END TABLE" << endl;
}

void handleRecord(string channelId, string tableName, string recordId,
                  string jsonString) {
  if (RAW_DEBUG)
    cout << "RECORD(" << channelId << ", " << tableName << ", " << channelId << ") = " << jsonString << endl;
}

struct RawJSONHandler {
  bool StartObject() {
    depth++;
    assert(depth < MAX_DEPTH);

    if (RAW_DEBUG) cout << "StartObject(depth=" << depth << ")" << endl;

    if (depth == CHANNEL_DEPTH &&
        lastKeys[CHANNELS_DEPTH - 1] == CHANNELS_TOKEN) {
      startChannel(lastKey);
    }

    if (writer) return writer->StartObject();

    return true;
  }
  bool Key(const char *key, SizeType length, bool copy) {
    if (writer) return writer->Key(key, length, copy);

    if (RAW_DEBUG) cout << "Key(" << key << ", depth=" << depth << ")" << endl;
    lastKey = key;
    lastKeys[depth] = key;

    return true;
  }
  bool EndObject(SizeType memberCount) {
    if (RAW_DEBUG) cout << "EndObject(" << memberCount << ")" << endl;

    if (writer) writer->EndObject(memberCount);

    if (depth == CHANNEL_DEPTH &&
        lastKeys[CHANNELS_DEPTH - 1] == CHANNELS_TOKEN) {
      endChannel();
    }
    lastKeys[depth] = string();
    depth--;

    return true;
  }
  bool StartArray() {
    if (writer) return writer->StartArray();

    if (RAW_DEBUG) cout << "StartArray()" << endl;
    return true;
  }
  bool EndArray(SizeType elementCount) {
    if (writer) return writer->EndArray(elementCount);

    if (RAW_DEBUG) cout << "EndArray(" << elementCount << ")" << endl;
    return true;
  }
  bool Null() {
    if (writer) return writer->Null();

    if (RAW_DEBUG) cout << "Null()" << endl;
    return true;
  }
  bool Bool(bool b) {
    if (writer) return writer->Bool(b);

    if (RAW_DEBUG) cout << "Bool(" << boolalpha << b << ")" << endl;
    return true;
  }
  bool Int(int i) {
    if (writer) return writer->Int(i);

    if (RAW_DEBUG) cout << "Int(" << i << ")" << endl;
    return true;
  }
  bool Uint(unsigned u) {
    if (writer) return writer->Uint(u);

    if (RAW_DEBUG) cout << "Uint(" << u << ")" << endl;
    return true;
  }
  bool Int64(int64_t i) {
    if (writer) return writer->Int64(i);

    if (RAW_DEBUG) cout << "Int64(" << i << ")" << endl;
    return true;
  }
  bool Uint64(uint64_t u) {
    if (writer) return writer->Uint64(u);

    if (RAW_DEBUG) cout << "Uint64(" << u << ")" << endl;
    return true;
  }
  bool Double(double d) {
    if (writer) return writer->Double(d);

    if (RAW_DEBUG) cout << "Double(" << d << ")" << endl;
    return true;
  }
  bool RawNumber(const char *str, SizeType length, bool copy) {
    if (writer) return writer->RawNumber(str, length, copy);

    if (RAW_DEBUG)
      cout << "Number(" << str << ", " << length << ", " << boolalpha << copy << ")" << endl;
    return true;
  }
  bool String(const char *str, SizeType length, bool copy) {
    if (writer) return writer->String(str, length, copy);

    if (RAW_DEBUG)
      cout << "String(" << str << ", " << length << ", " << boolalpha << copy << ")" << endl;

    if (lastKeys[RECORDS_DEPTH] == RECORDS_TOKEN) {
      auto recordId = lastKey;
      auto tableName = lastKeys[TABLE_NAME_DEPTH];
      auto channelId = lastKeys[CHANNELS_DEPTH];
      handleRecord(channelId, tableName, recordId, str);
    }

    return true;
  }
};

inline bool ends_with(std::string const &value, std::string const &ending) {
  if (ending.size() > value.size()) return false;
  return std::equal(ending.rbegin(), ending.rend(), value.rbegin());
}

void parseFirebaseJSON(string filename) {
  RawJSONHandler handler;
  Reader reader;

  loadDataBufferDir = "/scratch/" + filename + "-tsvs/";
  filesystem::create_directories(loadDataBufferDir);

  originalJSONBytes = std::filesystem::file_size(filename);

  FILE *fp = fopen(filename.c_str(), "r");
  
  char readBuffer[65536];
  FileReadStream is(fp, readBuffer, sizeof(readBuffer));
  reader.Parse(is, handler);

  commitRecords();
}

int main(int argc, char *argv[]) {
  if (argc != 2) {
    cout << "Usage: " << argv[0] << " <json file>" << endl;
    return 1;
  }

  string filename = argv[1];
  cout << "Parsing: " << filename << endl;

  cout << "Connecting to MySQL..." << endl;
  try {
    db = getDB();

    std::unique_ptr<sql::Statement> stmt(db->createStatement());
    stmt->execute("DROP DATABASE IF EXISTS `" + DB_NAME + "`;");  // DEBUG: clear the unfirebase DB
    stmt->execute("CREATE DATABASE IF NOT EXISTS `" + DB_NAME + "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

    db->setSchema(DB_NAME);

    stmt->execute("CREATE TABLE IF NOT EXISTS `" + TABLE_NAME + "` (`channel` VARCHAR(45) NOT NULL, `json` MEDIUMTEXT NULL, PRIMARY KEY (`channel`));");
    stmt->execute("DELETE FROM `" + TABLE_NAME + "`;"); // DEBUG: clear the unfirebase table
    //stmt->execute("SET GLOBAL max_allowed_packet=10000000000;"); // We'd need to set this to allow large inserts, but we're using load data for now (and it needs SUPER privs)
    stmt->execute("SET autocommit=0;");
    stmt->execute("SET unique_checks=0;");
    stmt->execute("COMMIT;");

    insertUnfirebaseStatement = db->prepareStatement("INSERT INTO `" + TABLE_NAME + "` VALUES (?, ?)");

    if (db->isValid()) {
      cout << "Connected to MySQL!" << endl;
    } else {
      cerr << "Failed to connect to MySQL!" << endl;
      return EXIT_FAILURE;
    }

    if (LOAD_DATA_IN_THREAD) {
      boost::thread_group dataThreads;
      for (int i = 0; i < NUM_DATA_THREADS; i++) {
        dataThreads.create_thread(loadDataThread);
      }
      parseFirebaseJSON(filename);
      done = true;
      dataThreads.join_all();
    } else {
      parseFirebaseJSON(filename);
    }
    filesystem::remove_all(loadDataBufferDir);

  } catch (sql::SQLException &e) {
    cout << "# ERR: SQLException in " << __FILE__ << "on line " << __LINE__ << endl;
    cout << "# ERR: " << e.what();
    cout << " (MySQL error code: " << e.getErrorCode();
    cout << ", SQLState: " << e.getSQLState() << " )" << endl;

    return EXIT_FAILURE;
  }

  delete insertUnfirebaseStatement;
  db->close();
  delete db;

  cout << "DONE with parse-firebase-json!" << endl;

  // If you launch like:
  // `MallocStackLogging=1 ./parse lil-prod.json`
  // Then we invoke the `leaks` command to report memory leaks at the end.
  if (getenv("MallocStackLogging")) system("leaks parse-firebase-json");

  return 0;
}
