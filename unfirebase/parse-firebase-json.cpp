// clang-format off
#include <assert.h>
#include <rapidjson/filereadstream.h>
#include <rapidjson/istreamwrapper.h>
#include <rapidjson/reader.h>
#include <rapidjson/stringbuffer.h>
#include <rapidjson/writer.h>
#include <rapidjson/document.h>
#include <rapidjson/error/en.h>
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
#include <unordered_map> 


#include "munged-reader.h"
#include "stock-table-names.h"

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

enum KindOfRow {
  Record=0,
  Table,
  Channel,
};

// What are we storing in a single MySQL row?
// 1. One student data record?
// 2. One student data table (containing many records)?
// 3. All the data tables for a student channel aka project?
const KindOfRow KIND_OF_ROW = Record;

// Which MySQL table are we storing this data in?
const unordered_map<KindOfRow, string> kindOfRowToSQLTableName = {
  { Record, "records" }, 
  { Channel, "channels" }, 
  { Table, "tables" },
};
const string TABLE_NAME = kindOfRowToSQLTableName.at(KIND_OF_ROW);

// Don't load tables into MySQL that are identical copies of stock data sets
// These are code.org supplied datasets like 'Words' or 'US States'
// that have many un-edited copies in student projects (>80% of data in firebase)
// 
// See stock-table-names.h for the list of stock table names
const bool DONT_UPLOAD_STOCK_TABLES = true;

// Use bulk `LOAD DATA LOCAL INFILE` instead of `INSERT INTO` statements
// LOAD DATA INFILE statements /should/ be much faster, it copies the
// TSV file to the server, and does an optimized load there straight from disk.
const bool LOAD_DATA_INSTEAD_OF_INSERT = true;

// If LOAD_DATA_IN_THREAD, then spawn threads to do the MySQL `LOAD DATA LOCAL INFILE`
// and leave the main thread for parsing JSON
const bool LOAD_DATA_IN_THREAD = true;
const uint NUM_DATA_THREADS = 4;
const uint NUM_DATA_FILES_QUEUED = NUM_DATA_THREADS * 2;

// This determines the `LOAD DATA LOCAL INFILE` tsv batch size and/or how often we COMMIT
const uint64_t NUMBER_OF_ROWS_BEFORE_COMMIT = 
  (KIND_OF_ROW == Record && LOAD_DATA_INSTEAD_OF_INSERT)
    ? 250000
    : 1000;

// If this is False, we don't actually transmit individual datum to MySQL
const bool DEBUG_SEND_DATA_TO_MYSQL = true;

// In LOAD_DATA_INSTEAD_OF_INSERT mode, we write TSVs to this directory
const string TMP_DIR = "/tmp/parse-firebase-json/";

// Should we use a JSON type column or a VARCHAR in MySQL?
const bool USE_MYSQL_JSON_COLUMN = true;

// Different levels of debug output
const bool RAW_DEBUG = false;
const bool FINE_DEBUG = false;

// On Linux we use tmpfs to write TSVs here without hitting the disk
// these parameters are used to estimate the appropriate size of tmpfs
const uint64_t BYTES_PER_ROW = KIND_OF_ROW == Record ? 1000 : 250000;
const uint64_t BYTES_PER_DATA_FILE = BYTES_PER_ROW * NUMBER_OF_ROWS_BEFORE_COMMIT;
const uint64_t TMP_DIR_TMPFS_SIZE = NUM_DATA_FILES_QUEUED * BYTES_PER_DATA_FILE * 4;

const char *getEnv(string envVar, const char *defaultVal) {
  const char *env = getenv(envVar.c_str());
  return env ? env : defaultVal;
}

// MySQL DB Name
const string DB_NAME = getEnv("MYSQL_DB", "unfirebase");

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
  options["CLIENT_COMPRESS"] = true;

  return driver->connect(options);
}

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
const int TABLE_DEPTH = 7;

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

bool inAChannel = false;

// "INSERT INTO unfirebase VALUES (?, ?)"
sql::PreparedStatement *insertStatement = nullptr;
uint64_t unComittedRecords = 0;
uint64_t totalRecordsCount = 0;
atomic<uint64_t> numRecordBytes {0};
uint64_t originalJSONBytes = 0;
std::mutex numRecordBytesMutex;

chrono::system_clock::time_point bandwidthStartClock;
bool bandwidthStartClockInitialized = false;
uint64_t bandwidthStartNumRecordBytes = 0;
double bandwidthSamplingDurationTarget = 5000.0f /* seconds, start small for first sample */;

boost::lockfree::queue<char *, boost::lockfree::capacity<NUM_DATA_FILES_QUEUED>> loadDataFilenameQueue;
std::atomic<uint64_t> numDataJobsQueued{0};

void loadData(string tsvFilename) {
  numRecordBytesMutex.lock();
  cout << "LOAD DATA LOCAL INFILE '" << tsvFilename << "'" << endl;
  numRecordBytesMutex.unlock();

  if (DEBUG_SEND_DATA_TO_MYSQL) {
    std::unique_ptr<sql::Statement> stmt(db->createStatement());
    stmt->execute(
      "LOAD DATA LOCAL INFILE '" + tsvFilename + "'" +
        + "INTO TABLE `" + TABLE_NAME + "` "
        + "CHARACTER SET utf8mb4 "
        + "FIELDS TERMINATED BY '\t' ESCAPED BY '' "
        + "LINES TERMINATED BY '\n' "
        + ";"
    );
    stmt->execute("COMMIT;");
  }
  
  numRecordBytesMutex.lock();
  numRecordBytes += std::filesystem::file_size(tsvFilename);
  double percent = (round(100 * 100 * numRecordBytes / (double)originalJSONBytes) / 100);
  cout << "Written to MySQL: " << "\033[1m" << (round(numRecordBytes / (1000000000.0) * 100) / 100) << "GB" << "\033[0m" << ", \033[1;32m" << "~" << percent << "%\033[0m" << endl;  
  numRecordBytesMutex.unlock();

  std::filesystem::remove(tsvFilename);
}

boost::atomic<bool> done(false);
void loadDataThread() {
  db = getDB();
  db->setSchema(DB_NAME);

  cout << "loadDataThread: starting" << endl;
  char *tsvFilename;
  while (!done) {
    while (loadDataFilenameQueue.pop(tsvFilename)) {
      cout << "loadDataThread: taking job (queue size=" << --numDataJobsQueued << ")" << endl;
      loadData(tsvFilename);
      delete tsvFilename;
    }
  }

  cout << "loadDataThread: done=true, draining queue" << endl;

  while (loadDataFilenameQueue.pop(tsvFilename)) {
    cout << "Num data jobs queued: " << --numDataJobsQueued << endl;
    loadData(tsvFilename);
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

inline void commitRecords() {
  if (LOAD_DATA_INSTEAD_OF_INSERT) {
    if (LOAD_DATA_IN_THREAD) {
      // we're using threads, but we're not in one, just queue it up
      char *filename = strdup(loadDataBufferTSVFilename.c_str());
      numDataJobsQueued++;
      while (!loadDataFilenameQueue.push(filename));
    } else {
      loadData(loadDataBufferTSVFilename);
    }
    delete loadDataBufferTSV;
    loadDataBufferTSV = nullptr;
  } else {
    cout << "COMMIT; (totalRecordsCount=" << totalRecordsCount << ")" << endl;
    if (DEBUG_SEND_DATA_TO_MYSQL) {
      std::unique_ptr<sql::Statement> stmt(db->createStatement());
      stmt->execute("COMMIT;");
    }
  }
  printBandWidthTiming();
  unComittedRecords = 0;
}

class JSONParseException : public std::exception {
  public:
  const char* err;
  uint64_t offset;
  const string &document;

  JSONParseException(const string &document_, ParseResult result) : 
    document(document_)
  {
    err = GetParseError_En(result.Code());
    offset = result.Offset();
  }
};

inline bool jsonDeepEqual(const string &reference, const string &document) {
  // FIXME: we don't store the parse tree for the reference here, so
  // its super super slow
  Document ref;
  ref.Parse(reference.c_str());

  Document doc;
  ParseResult ok = doc.Parse(document.c_str());
  if (!ok) {
    cerr << "JSON parse error: " << GetParseError_En(ok.Code()) << " (" << ok.Offset() << ")" << endl;
    cerr << endl << endl;
    exit(EXIT_FAILURE);
    throw JSONParseException(document, ok);
  }

  return ref == doc;
}

inline bool isStockTable(const string &tableName, const string &json) {
  const bool TABLE_NAME_COUNTING = false;

  static unordered_map<string, string> stockTableJSON;
  static unordered_map<string, uint64_t> tableNameToCount; // if TABLE_NAME_COUNTING
  static uint64_t tableBytes = 0; // DONT_UPLOAD_STOCK_TABLES
  static uint64_t tableBytesStock = 0; // DONT_UPLOAD_STOCK_TABLES

  static bool firstTimeRun = true;
  if (firstTimeRun) {
    firstTimeRun = false;
    cerr << "WARNING: inStockTable() is really slow, it does a JSON deep equal, and we should move its execution to a data thread" << endl;
  }

  auto bytes = json.length();
  tableBytes += bytes;

  bool isStock = false;
  if (STOCK_TABLE_NAMES.count(tableName) > 0) {
    if (stockTableJSON.count(tableName) == 0) {
      // FIXME: we set the first version of any "stock table" to be the
      // reference table, but we should really get the reference table
      // from a canonical source
      stockTableJSON[tableName] = json;
    }

    // This is the core logic of isStockTable(), first we check if their strings
    // happen to be string equal (sometimes Firebase preserves key order), and if not
    // we then check if the JSON are deep equal (ignores key order!)
    isStock = stockTableJSON[tableName] == json || jsonDeepEqual(stockTableJSON[tableName], json);

  } else if (TABLE_NAME_COUNTING) {
    //cout << tableName << endl;
    tableNameToCount[tableName]++;
  }

  // if (tableName == "Fortune Data") {
  //   cout << "Was " << tableName << " stock? " << isStock << endl;
  //   // if (isStock) {
  //   //   cout << json << endl;
  //   // }
  // }

  if (TABLE_NAME_COUNTING && totalRecordsCount % 10000 == 0) {
    vector<pair<string, uint64_t> > pairs;
    auto m = tableNameToCount;
    copy(m.begin(), m.end(), back_inserter<vector<pair<string, uint64_t> > >(pairs));
    
    sort(pairs.begin(), pairs.end(), [=](std::pair<string, uint64_t>& a, std::pair<string, uint64_t>& b) {
      return a.second > b.second;
    });
    cout << "Table Name, Count" << endl;
    for (size_t i = 0; i < pairs.size(); ++i) {
      if (pairs[i].second > 2)
      cout << pairs[i].first << " , " << pairs[i].second << "\n";
    }
    exit(0);
  }

  if (isStock) {
    tableBytesStock += bytes;

    // We don't upload stock tables anymore, but we DO claim their bytes
    // so the percentage progress indicator is better than useless
    numRecordBytes += bytes;

    // burp once every 10000 times
    static uint64_t nTimesSincePrint = 0;
    if (DONT_UPLOAD_STOCK_TABLES && nTimesSincePrint++ % 10000 == 0)
      cout << "DONT_UPLOAD_STOCK_TABLES=true has skipped uploading of " << 100.0 * ((double)tableBytesStock) / tableBytes << "\%" << " of bytes" << endl;

  }

  return isStock;
}

inline void insertIntoDB(const string &channelId, const string &tableName, const string &recordId, const string &json) {
    
  unComittedRecords++;

  if (LOAD_DATA_INSTEAD_OF_INSERT) {
    if (!loadDataBufferTSV) {
      //string shortFilename = filesystem::path(filename).filename();
      loadDataBufferTSVFilename = loadDataBufferDir + to_string(totalRecordsCount) + ".tsv";
      loadDataBufferTSV = new ofstream(loadDataBufferTSVFilename);
    }

    // FIXME: we're not escaping the json string, so if it contains tabs we're screwed
    if (KIND_OF_ROW == Record) {
      *loadDataBufferTSV << channelId << "\t" << tableName << "\t" << recordId << "\t" << json << endl;
    } else if (KIND_OF_ROW == Table) {
      *loadDataBufferTSV << channelId << "\t" << tableName << "\t" << json << endl;
    } else if (KIND_OF_ROW == Channel) {
      *loadDataBufferTSV << channelId << "\t" << json << endl;
    }
  } else {
    numRecordBytes += json.length();
    if (DEBUG_SEND_DATA_TO_MYSQL) {
      if (KIND_OF_ROW == Record) {
        insertStatement->setString(1, channelId);
        insertStatement->setString(2, tableName);
        insertStatement->setString(3, recordId);
        insertStatement->setString(4, json);
        insertStatement->execute();
      } else if (KIND_OF_ROW == Table) {
        insertStatement->setString(1, channelId);
        insertStatement->setString(2, tableName);
        insertStatement->setString(3, json);
        insertStatement->execute();
      } else if (KIND_OF_ROW == Record) {
        insertStatement->setString(1, currentChannelName);
        insertStatement->setString(2, json);
        insertStatement->execute();
      }
    }
  }

  totalRecordsCount++;

  if (unComittedRecords >= NUMBER_OF_ROWS_BEFORE_COMMIT) {
    commitRecords();
  }
}

const string NO_TABLE_NAME = "";
const string NO_RECORD_ID = "";

inline void startChannel(string channelName) {
  //assert(currentChannelName == NO_CHANNEL);

  inAChannel = true;

  if (FINE_DEBUG) cout << "START CHANNEL " << channelName << endl;
  currentChannelName = channelName;

  static uint64_t nChannelsProcessed = 1;
  if (nChannelsProcessed++ % 10000 == 0) {
    cout << "Channel #" << nChannelsProcessed-1 << ": channel_id='" << channelName << "'" << endl;
  }

  if (KIND_OF_ROW == Channel) {
    writerBuffer = new StringBuffer();
    writer = new Writer<StringBuffer>(*writerBuffer);
  }
}

inline void endChannel() {
  assert(currentChannelName != NO_CHANNEL);

  if (KIND_OF_ROW == Channel) {
    if (writer) {
      insertIntoDB(currentChannelName, NO_TABLE_NAME, NO_RECORD_ID, writerBuffer->GetString());
      delete writer;
      delete writerBuffer;
      writer = nullptr;
      writerBuffer = nullptr;
    } else {
      insertIntoDB(currentChannelName, NO_TABLE_NAME, NO_RECORD_ID, "{ 'FAKE': 'DATA IS FAKE'}");
    }    
  }

  if (FINE_DEBUG) cout << "END CHANNEL " << currentChannelName << endl;
  //currentChannelName = NO_CHANNEL;
  inAChannel = false;
}

inline void startTable(const string &tableName) {
  if (FINE_DEBUG) cout << "START TABLE " << tableName << endl;
  
  if (KIND_OF_ROW == Table || (KIND_OF_ROW == Record && DONT_UPLOAD_STOCK_TABLES)) {
    writerBuffer = new StringBuffer();
    writer = new Writer<StringBuffer>(*writerBuffer);
  }
}

// In KIND_OF_ROW == Record mode, when DONT_UPLOAD_STOCK_TABLES=true
// we have to cache our records until we finish the table and are
// able to check if its a stock table or not.
vector<pair<string, string>> recordsInTable;

inline void endTable(const string &tableName) {
  if (FINE_DEBUG) cout << "END TABLE" << endl;

  if (KIND_OF_ROW == Table || (KIND_OF_ROW == Record && DONT_UPLOAD_STOCK_TABLES)) {
    assert(writer != nullptr);
    const string &json = writerBuffer->GetString();
    const string &channelId = currentChannelName;

    try {
      // FIXME: isStockTable() requires a SUPER expensive JSON deep equal, we
      // should figure out how to do this in the data threads instead of here in the main thread
      if (DONT_UPLOAD_STOCK_TABLES && isStockTable(tableName, json)) {
        // cout << "SKIPPING STOCK TABLE " << tableName << endl;
      } else {
        if (KIND_OF_ROW == Table) {
          insertIntoDB(channelId, tableName, NO_RECORD_ID, json.c_str());
        } else if (KIND_OF_ROW == Record) {
          for (auto &record : recordsInTable) {
            insertIntoDB(channelId, tableName, record.first, record.second);
          }
        }

        static uint64_t nTablesUploaded = 1;
        if (nTablesUploaded++ % 5000 == 0) {
          cout << "Table #" << nTablesUploaded-1 << ": channel_id='" << channelId << "' AND table_name='" << tableName << "'" << endl;
        }
      }
    } catch (JSONParseException& e) {
      static uint64_t nTableParseErrors = 0;

      nTableParseErrors++;

      string filename = "error-in-table_" + channelId + "_" + tableName + ".json";
      ofstream errorFile(filename);
      errorFile << e.document << endl;
      errorFile.close();

      cerr << endl;
      cerr << "TABLE(" << channelId << ", " << tableName << ") was not valid JSON and was dropped" << endl;
      cerr << "JSON parse error #" << nTableParseErrors << ": " << e.err << " (" << e.offset << ")" << endl;
      cerr << "See: " << filename << endl;
      cerr << endl;
    }

    
    recordsInTable.clear();

    delete writer;
    delete writerBuffer;
    writer = nullptr;
    writerBuffer = nullptr;
  }
}

static uint64_t singleRecordJSONParseErrors = 0;
inline void handleRecord(string channelId, string tableName, string recordId,
                  string jsonString) {
  if (RAW_DEBUG)
    cout << "RECORD(" << channelId << ", " << tableName << ", " << recordId << ") = " << jsonString << endl;

  // It turns out the JSON parser MySQL uses is ... RapidJSON!
  // So we can validate each row before sending it to MySQL
  // for the case where we use a JSON column type
  if (USE_MYSQL_JSON_COLUMN) {

    // FIXME: this does a double-json-parse on some values
    // because we also parse (some) json in isStockTable()

    Document doc1;
    ParseResult ok = doc1.Parse(jsonString.c_str());
    if (!ok) {
      singleRecordJSONParseErrors++;
      cerr << endl;
      cerr << "RECORD(" << channelId << ", " << tableName << ", " << recordId << ")" << endl;
      cerr << "JSON parse error #" << singleRecordJSONParseErrors << ": " << GetParseError_En(ok.Code()) << " (" << ok.Offset() << ")" << endl;
      cerr << endl;
      cerr << "Trying to parse " << ":" << endl;
      cerr << jsonString << endl;
      cerr << endl;
      return;
    }
  }

  if (DONT_UPLOAD_STOCK_TABLES) {
    recordsInTable.push_back(make_pair(recordId, jsonString));
  } else {
    insertIntoDB(channelId, tableName, recordId, jsonString.c_str());
  }
}

void printLastKeys() {
  cout << "lastKeys: ";
  for (int i =0; i <= depth; i++) {
    cout << lastKeys[i] << ".";
  }
  cout << endl;
}

struct RawJSONHandler {
  bool StartObject() {
    depth++;
    assert(depth < MAX_DEPTH);

    if (RAW_DEBUG) cout << "StartObject(depth=" << depth << ")" << endl;

    if (depth == CHANNEL_DEPTH &&
        lastKeys[CHANNELS_DEPTH - 1] == CHANNELS_TOKEN) {
      startChannel(lastKey);
    } else if (depth == TABLE_DEPTH && lastKeys[TABLE_DEPTH-3] == "storage") {
      startTable(lastKeys[TABLE_DEPTH-1]);
    }

    if (writer) {
      if (!writer->StartObject()) {
        cout << "StartObject() failed" << endl;
        return false;
      }
      return true;
    }

    return true;
  }
  bool Key(const char *key, SizeType length, bool copy) {
    lastKeys[depth] = key;
    lastKey = key;

    if (writer) { if (!writer->Key(key, length, copy)) { cout << "Key(key, length, copy) failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG) cout << "Key(" << key << ", depth=" << depth << ")" << endl;

    return true;
  }
  bool EndObject(SizeType memberCount) {
    if (RAW_DEBUG) cout << "EndObject(" << memberCount << ")" << endl;

    if (writer) writer->EndObject(memberCount);

    if (depth == CHANNEL_DEPTH &&
        lastKeys[CHANNELS_DEPTH - 1] == CHANNELS_TOKEN) {
      endChannel();
    } else if (depth == TABLE_DEPTH && lastKeys[TABLE_DEPTH-3] == "storage") {
      endTable(lastKeys[TABLE_DEPTH-1]);
    }

    lastKeys[depth] = string();
    depth--;

    return true;
  }
  bool StartArray() {
    if (writer) { if (!writer->StartArray()) { cout << "StartArray() failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG) cout << "StartArray()" << endl;
    return true;
  }
  bool EndArray(SizeType elementCount) {
    if (writer) { if (!writer->EndArray(elementCount)) { cout << "EndArray(elementCount) failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG) cout << "EndArray(" << elementCount << ")" << endl;
    return true;
  }
  bool Null() {
    if (writer) { if (!writer->Null()) { cout << "Null() failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG) cout << "Null()" << endl;
    return true;
  }
  bool Bool(bool b) {
    if (writer) { if (!writer->Bool(b)) { cout << "Bool(b) failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG) cout << "Bool(" << boolalpha << b << ")" << endl;
    return true;
  }
  bool Int(int i) {
    if (writer) { if (!writer->Int(i)) { cout << "Int(i) failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG) cout << "Int(" << i << ")" << endl;
    return true;
  }
  bool Uint(unsigned u) {
    if (writer) { if (!writer->Uint(u)) { cout << "Uint(u) failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG) cout << "Uint(" << u << ")" << endl;
    return true;
  }
  bool Int64(int64_t i) {
    if (writer) { if (!writer->Int64(i)) { cout << "Int64(i) failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG) cout << "Int64(" << i << ")" << endl;
    return true;
  }
  bool Uint64(uint64_t u) {
    if (writer) { if (!writer->Uint64(u)) { cout << "Uint64(u) failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG) cout << "Uint64(" << u << ")" << endl;
    return true;
  }
  bool Double(double d) {
    if (writer) { if (!writer->Double(d)) { cout << "Double(d) failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG) cout << "Double(" << d << ")" << endl;
    return true;
  }
  bool RawNumber(const char *str, SizeType length, bool copy) {
    if (writer) { if (!writer->RawNumber(str, length, copy)) { cout << "RawNumber(str, length, copy) failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG)
      cout << "Number(" << str << ", " << length << ", " << boolalpha << copy << ")" << endl;
    return true;
  }
  bool String(const char *str, SizeType length, bool copy) {
    if (KIND_OF_ROW == Record && lastKeys[RECORDS_DEPTH] == RECORDS_TOKEN) {
      auto recordId = lastKey;
      auto tableName = lastKeys[TABLE_NAME_DEPTH];
      auto channelId = lastKeys[CHANNELS_DEPTH];
      handleRecord(channelId, tableName, recordId, str);
    }

    if (writer) { if (!writer->String(str, length, copy)) { cout << "String(str, length, copy) failed " << endl; printLastKeys(); return false; } return true; }

    if (RAW_DEBUG)
      cout << "String(" << str << ", " << length << ", " << boolalpha << copy << ")" << endl;

    return true;
  }
};

inline bool ends_with(std::string const &value, std::string const &ending) {
  if (ending.size() > value.size()) return false;
  return std::equal(ending.rbegin(), ending.rend(), value.rbegin());
}

void handleParseError(ParseResult result, string filename) {
  uint64_t offset = result.Offset();

  cerr << endl;
  cerr << "JSON parse error at byte offset " << offset << ", code " << result.Code() << ": " << GetParseError_En(result.Code()) << endl;
  cerr << endl;

  cout << "Were we in the middle of a channel when we quit? " << boolalpha << inAChannel << endl;
  if (inAChannel) {
    string channelSoFarName = "error-channel-write-buffer-" + currentChannelName + ".json";
    ofstream channelSoFar(channelSoFarName);
    channelSoFar << writerBuffer->GetString() << endl;
    channelSoFar.close();
    cout << "Wrote parsed channel JSON so far to: " << channelSoFarName << endl;
    printLastKeys();
  }

  cout << "Last channelID: " << currentChannelName << endl;
  cout << "Current Record Number: " << totalRecordsCount << endl;

  const uint64_t BLOCK_SIZE = 4096;
  string block(BLOCK_SIZE, ' ');
  ifstream file(filename, ios::binary);

  // Write out the bytes before the error
  file.seekg(offset-BLOCK_SIZE);
  file.read(&block[0], BLOCK_SIZE);
  ofstream bytesBeforeError("error-bytes-before.json");
  bytesBeforeError << block << endl;
  bytesBeforeError.close();
  cout << "Wrote file contents before error byte offset to: " << "error-bytes-before.json" << endl;

  // Write out the bytes after the error
  file.seekg(offset);
  file.read(&block[0], BLOCK_SIZE);
  ofstream bytesAfterError("error-bytes-after.json");
  bytesAfterError << block << endl;
  bytesAfterError.close();
  cout << "Wrote file contents after error byte offset to: " << "error-bytes-after.json" << endl;

  cerr << endl;
  cerr << "JSON parse error at byte offset " << offset << ", code " << result.Code() << ": " << GetParseError_En(result.Code()) << endl;
  cerr << endl;

  exit(EXIT_FAILURE);
}

void parseFirebaseJSON(string filename) {
  RawJSONHandler handler;
  //Reader reader;
  MungedReader<UTF8<>, UTF8<> > reader;

  loadDataBufferDir =  TMP_DIR + filename + "-tsvs/";
  filesystem::remove_all(loadDataBufferDir);
  filesystem::create_directories(loadDataBufferDir);

  #if __linux__
  if (filesystem::space(TMP_DIR).capacity != TMP_DIR_TMPFS_SIZE) {
    cerr << "Capacity of " << TMP_DIR << " is: " << filesystem::space(TMP_DIR).capacity << endl;
    cerr << "WARNING: " << TMP_DIR << " not the right size!!!! Expected: " << TMP_DIR_TMPFS_SIZE << " bytes" << endl;
    cerr << endl;
    cerr << "Make sure you have a tmpfs mounted at " << TMP_DIR << "." << endl;
    string cmd = "sudo mount -t tmpfs -o size=" + to_string(TMP_DIR_TMPFS_SIZE) + " tmpfs " + TMP_DIR;
    cerr << "If not, run: " << cmd << endl;
    cerr << endl;
    this_thread::sleep_for (std::chrono::seconds(2));
  }
  #endif

  originalJSONBytes = std::filesystem::file_size(filename);

  FILE *fp = fopen(filename.c_str(), "r");
  
  char readBuffer[65536];
  FileReadStream is(fp, readBuffer, sizeof(readBuffer));

  // Start the parse going, everything happens here
  ParseResult ok = reader.Parse(is, handler);
  if (!ok) {
    handleParseError(ok, filename);
  } else {
    cout << "JSON parse succeeded!" << endl;
  }

  commitRecords();
}

void setupDB(sql::Connection *db) {
  if (!DEBUG_SEND_DATA_TO_MYSQL) {
    cerr << "DEBUG_SEND_DATA_TO_MYSQL=true, skipping MySQL data upload" << endl;
    return;
  }

  cout << "Writing to MySQL table: " << DB_NAME << "." << TABLE_NAME << endl;
  cout << "Connecting to MySQL..." << endl;

  std::unique_ptr<sql::Statement> stmt(db->createStatement());

  // stmt->execute("DROP DATABASE IF EXISTS `" + DB_NAME + "`;");  // DEBUG: clear the unfirebase DB
  stmt->execute("CREATE DATABASE IF NOT EXISTS `" + DB_NAME + "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

  db->setSchema(DB_NAME);

  stmt->execute("DROP TABLE IF EXISTS `" + TABLE_NAME + "`;");

  const string JSON_COLUMN_TYPE = USE_MYSQL_JSON_COLUMN ? "JSON" : "VARCHAR(8192)";
  if (KIND_OF_ROW == Record) {
    string createTable = "CREATE TABLE IF NOT EXISTS `" + TABLE_NAME + "` (" +
      "`channel_id` VARCHAR(45) NOT NULL, " +
      "`table_name` VARCHAR(45) NOT NULL, " +
      "`record_id` INT NOT NULL, " +
      "`json` " + JSON_COLUMN_TYPE + " NULL, " +
      "PRIMARY KEY (`channel_id`, `table_name`, `record_id`), " + 
      "INDEX `channel_index` (`channel_id`));";
    stmt->execute(createTable);
    insertStatement = db->prepareStatement("INSERT INTO `" + TABLE_NAME + "` VALUES (?, ?, ?, ?)");
  } else if (KIND_OF_ROW == Table) {
    string createTable = "CREATE TABLE IF NOT EXISTS `" + TABLE_NAME + "` (" +
      "`channel_id` VARCHAR(45) NOT NULL, " +
      "`table_name` VARCHAR(45) NOT NULL, " +
      "`json` " + JSON_COLUMN_TYPE + " NULL, " +
      "PRIMARY KEY (`channel_id`, `table_name`), " + 
      "INDEX `channel_index` (`channel_id`));";
    stmt->execute(createTable);
    insertStatement = db->prepareStatement("INSERT INTO `" + TABLE_NAME + "` VALUES (?, ?, ?)");
  } else if (KIND_OF_ROW == Channel) {
    string createTable = "CREATE TABLE IF NOT EXISTS `" + TABLE_NAME + "` (" +
      "`channel_id` VARCHAR(45) NOT NULL, " +
      "`json` " + JSON_COLUMN_TYPE + " NULL, " +
      "PRIMARY KEY (`channel_id`);";
    stmt->execute(createTable);
    insertStatement = db->prepareStatement("INSERT INTO `" + TABLE_NAME + "` VALUES (?, ?)");
  } else {
    cerr << "Unknown KIND_OF_ROW: " << KIND_OF_ROW << endl;
    assert(false);
  }

  //stmt->execute("SET GLOBAL max_allowed_packet=10000000000;"); // We'd need to set this to allow large inserts, but we're using load data for now (and it needs SUPER privs)
  stmt->execute("SET autocommit=0;");
  stmt->execute("SET unique_checks=0;");
  stmt->execute("SET foreign_key_checks=0;");
  //stmt->execute("SET sql_log_bin=0;"); // NEEDS SUPER privs
  stmt->execute("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;");
  stmt->execute("COMMIT;");

  std::unique_ptr< sql::ResultSet >
    res(stmt->executeQuery("SHOW SESSION STATUS LIKE \"Compression\""));
  while (res->next()) {
    cout << "Checking compression: " << res->getString(1) << " " << res->getString(2) << endl;
  }

  if (db->isValid()) {
    cout << "Connected to MySQL!" << endl;
  } else {
    cerr << "Failed to connect to MySQL!" << endl;
    throw std::runtime_error("Failed to connect to MySQL!");
  }
}

int main(int argc, char *argv[]) {
  if (argc != 2) {
    cout << "Usage: " << argv[0] << " <json file>" << endl;
    return 1;
  }

  string filename = argv[1];
  cout << "Parsing: " << filename << endl;
  cout << "KIND_OF_ROW=" << TABLE_NAME << endl;

  try {
    db = getDB();
    setupDB(db);

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
    if (KIND_OF_ROW == Record && singleRecordJSONParseErrors > 0) {
      cout << "Number of Record dropped due to JSON parse errors: " << singleRecordJSONParseErrors << endl;
    }
    filesystem::remove_all(loadDataBufferDir);

  } catch (sql::SQLException &e) {
    cout << "# ERR: SQLException in " << __FILE__ << "on line " << __LINE__ << endl;
    cout << "# ERR: " << e.what();
    cout << " (MySQL error code: " << e.getErrorCode();
    cout << ", SQLState: " << e.getSQLState() << " )" << endl;

    return EXIT_FAILURE;
  }

  delete insertStatement;
  db->close();
  delete db;

  cout << "DONE with parse-firebase-json!" << endl;

  // If you launch like:
  // `MallocStackLogging=1 ./parse lil-prod.json`
  // Then we invoke the `leaks` command to report memory leaks at the end.
  if (getenv("MallocStackLogging")) system("leaks parse-firebase-json");

  return 0;
}
