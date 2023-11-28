#include <assert.h>
#include <iostream>
#include <fstream>
#include <string>

#include <rapidjson/reader.h>
#include <rapidjson/filereadstream.h>
#include <rapidjson/istreamwrapper.h>
#include <rapidjson/stringbuffer.h>
#include <rapidjson/writer.h>

// We're using the ancient JDBC C++ api, because the new X DevAPI
// requires the X Plugin to be enabled on the MySQL server, and
// AWS RDS explicitly does not support that :-( Also, its not
// enabled by default in MySQL 5.7 anyway, so ... whatevs
//
// Docs on the old API are here:
// https://dev.mysql.com/doc/dev/connector-cpp/latest/jdbc_ref.html
#include <mysql/jdbc.h>

sql::Connection *db;

using namespace std;
using namespace rapidjson;


string lastKey = "";
uint depth = 0;

const bool RAW_DEBUG = false;
const bool FINE_DEBUG = true;
const bool USE_WRITER_TO_COLLECT_STRING = true;
const bool LOAD_DATA_INSTEAD_OF_INSERT = true;
const uint MAX_DEPTH = 256;

std::vector<string> lastKeys = std::vector<string>(MAX_DEPTH);

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
                "1": "{\"id\":1,\"Word\":\"the\",\"Part of Speech\":\"article\",\"Per Million Words\":48974.7,\"
Length\":3.0}",
                "10": "{\"id\":10,\"Word\":\"it\",\"Part
 of Speech\":\"pronoun\",\"Per Million Words\":8605.5,\"
Length\":2.0}",
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

void startChannel(string channelName) {
  assert(currentChannelName == NO_CHANNEL);

  if (FINE_DEBUG)
    cout << "START CHANNEL " << channelName << endl;
  currentChannelName = channelName;

  if (USE_WRITER_TO_COLLECT_STRING) {
    writerBuffer = new StringBuffer();
    writer = new Writer<StringBuffer>(*writerBuffer);
  }
}

// "INSERT INTO unfirebase VALUES (?, ?)"
sql::PreparedStatement *insertUnfirebaseStatement = nullptr;
uint unComittedRecords = 0;
const uint NUMBER_OF_RECORDS_BEFORE_COMMIT = 20000;

void commitRecords() {
  std::unique_ptr<sql::Statement> stmt(db->createStatement());

  if (LOAD_DATA_INSTEAD_OF_INSERT) {
    cout << "LOADING DATA!" << endl;
    stmt->execute("LOAD DATA LOCAL INFILE '/tmp/load-data-buffer.tsv' INTO TABLE unfirebase FIELDS TERMINATED BY '\t' LINES TERMINATED BY '\n';");
    cout << "DONE LOADING DATA!" << endl;
    delete loadDataBufferTSV;
    loadDataBufferTSV = nullptr;
  }

  cout << "COMMITTING!" << endl;
  stmt->execute("COMMIT;");
  
  unComittedRecords = 0;
}

inline void insertIntoFirebase(string &channelId, const char *value) {
  unComittedRecords++;

  if (LOAD_DATA_INSTEAD_OF_INSERT) {
    if (!loadDataBufferTSV) {
      loadDataBufferTSV = new ofstream("/tmp/load-data-buffer.tsv");
    }
    *loadDataBufferTSV << channelId << "\t" << value << endl;
  } else {
    insertUnfirebaseStatement->setString(1, currentChannelName);
    insertUnfirebaseStatement->setString(2, value);
    insertUnfirebaseStatement->execute();
  }

  if (unComittedRecords > NUMBER_OF_RECORDS_BEFORE_COMMIT) {
    commitRecords();
  }
}

void endChannel() {
  assert(currentChannelName != NO_CHANNEL);

  if (writer)
  {
    insertIntoFirebase(currentChannelName, writerBuffer->GetString());
    delete writer;
    delete writerBuffer;
    writer = nullptr;
    writerBuffer = nullptr;
  } else {
    insertIntoFirebase(currentChannelName, "booobooobear");
  }

  if (FINE_DEBUG)
    cout << "END CHANNEL " << currentChannelName << endl;
  currentChannelName = NO_CHANNEL;
}

void startTable(string tableName) {
  if (FINE_DEBUG)
    cout << "START TABLE " << tableName << endl;
}

void endTable() {
  if (FINE_DEBUG)
    cout << "END TABLE" << endl;
}

void handleRecord(string channelId, string tableName, string recordId, string jsonString) {
  if (RAW_DEBUG)
    cout << "RECORD(" << channelId << ", " << tableName << ", " << channelId << ") = " << jsonString << endl;
}

struct RawJSONHandler
{
  bool StartObject()
  {
    depth++;
    assert(depth < MAX_DEPTH);

    if (RAW_DEBUG) cout << "StartObject(depth=" << depth << ")" << endl;

    if (depth == CHANNEL_DEPTH && lastKeys[CHANNELS_DEPTH-1] == CHANNELS_TOKEN) {
      startChannel(lastKey);
    }

    if (writer)
      return writer->StartObject();

    return true;
  }
  bool Key(const char *key, SizeType length, bool copy)
  {
    if (writer) return writer->Key(key, length, copy);

    if (RAW_DEBUG) cout << "Key(" << key << ", depth=" << depth << ")" << endl;
    lastKey = key;
    lastKeys[depth] = key;

    return true;
  }
  bool EndObject(SizeType memberCount)
  {
    if (RAW_DEBUG) cout << "EndObject(" << memberCount << ")" << endl;

    if (writer)
      writer->EndObject(memberCount);

    if (depth == CHANNEL_DEPTH && lastKeys[CHANNELS_DEPTH-1] == CHANNELS_TOKEN) {
      endChannel();
    }
    lastKeys[depth] = string();
    depth--;

    

    return true;
  }
  bool StartArray()
  {
    if (writer) return writer->StartArray();

    if (RAW_DEBUG) cout << "StartArray()" << endl;
    return true;
  }
  bool EndArray(SizeType elementCount)
  {
    if (writer) return writer->EndArray(elementCount);

    if (RAW_DEBUG) cout << "EndArray(" << elementCount << ")" << endl;
    return true;
  }
  bool Null()
  {
    if (writer) return writer->Null();

    if (RAW_DEBUG) cout << "Null()" << endl;
    return true;
  }
  bool Bool(bool b)
  {
    if (writer) return writer->Bool(b);

    if (RAW_DEBUG) cout << "Bool(" << boolalpha << b << ")" << endl;
    return true;
  }
  bool Int(int i)
  {
    if (writer) return writer->Int(i);

    if (RAW_DEBUG) cout << "Int(" << i << ")" << endl;
    return true;
  }
  bool Uint(unsigned u)
  {
    if (writer) return writer->Uint(u);

    if (RAW_DEBUG) cout << "Uint(" << u << ")" << endl;
    return true;
  }
  bool Int64(int64_t i)
  {
    if (writer) return writer->Int64(i);

    if (RAW_DEBUG) cout << "Int64(" << i << ")" << endl;
    return true;
  }
  bool Uint64(uint64_t u)
  {
    if (writer) return writer->Uint64(u);

    if (RAW_DEBUG) cout << "Uint64(" << u << ")" << endl;
    return true;
  }
  bool Double(double d)
  {
    if (writer) return writer->Double(d);

    if (RAW_DEBUG) cout << "Double(" << d << ")" << endl;
    return true;
  }
  bool RawNumber(const char *str, SizeType length, bool copy)
  {
    if (writer) return writer->RawNumber(str, length, copy);

    if (RAW_DEBUG) cout << "Number(" << str << ", " << length << ", " << boolalpha << copy << ")" << endl;
    return true;
  }
  bool String(const char *str, SizeType length, bool copy)
  {
    if (writer) return writer->String(str, length, copy);

    if (RAW_DEBUG) cout << "String(" << str << ", " << length << ", " << boolalpha << copy << ")" << endl;

    if (lastKeys[RECORDS_DEPTH] == RECORDS_TOKEN)
    {
      auto recordId = lastKey;
      auto tableName = lastKeys[TABLE_NAME_DEPTH];
      auto channelId = lastKeys[CHANNELS_DEPTH];
      handleRecord(channelId, tableName, recordId, str);
    }

    return true;
  }
};

inline bool ends_with(std::string const &value, std::string const &ending)
{
  if (ending.size() > value.size())
    return false;
  return std::equal(ending.rbegin(), ending.rend(), value.rbegin());
}

#include <boost/iostreams/filter/gzip.hpp>
#include <boost/iostreams/filtering_streambuf.hpp>
#include <boost/iostreams/copy.hpp>
void parseFirebaseJSON(string filename) {
  RawJSONHandler handler;
  Reader reader;

  if (ends_with(filename, ".gz"))
  {
    cerr << "WARNING: parsing gzipped file, this will be 2x slower due to rapidjson details" << endl;
    ifstream jsonFile(filename, ios::binary);
    boost::iostreams::filtering_istreambuf inbuf;
    inbuf.push(boost::iostreams::gzip_decompressor());
    inbuf.push(jsonFile);
    istream gzipStream(&inbuf);

    // ifstream ifs(filename);
    IStreamWrapper isw(gzipStream);

    reader.Parse(isw, handler);
  }
  else
  {
    FILE *fp = fopen(filename.c_str(), "r");

    char readBuffer[65536];
    FileReadStream is(fp, readBuffer, sizeof(readBuffer));
    reader.Parse(is, handler);
  }
  //commitRecords();
}

int main(int argc, char *argv[])
{
  if (argc != 2) {
    cout << "Usage: " << argv[0] << " <json file>" << endl;
    return 1;
  }

  string filename = argv[1];
  cout << "parsing: " << filename << endl;

  cout << "Connecting to MySQL..." << endl;

  const char *url = "tcp://localhost:3306";
  const string user = "root";
  const string password = "root";
  const string database = "unfirebase";

  try {
    //  get_driver_instance(), is not thread-safe. Either avoid invoking these methods from within multiple threads at once, or surround the calls with a mutex to prevent simultaneous execution in multiple threads.
    sql::Driver *driver = sql::mysql::get_driver_instance();

    sql::ConnectOptionsMap options;
    options["hostName"] = "localhost";
    options["userName"] = "root";
    options["password"] = "root";
    options["port"] = 3306;
    options["schema"] = "unfirebase";
    options["OPT_LOCAL_INFILE"] = 1;

    // db = driver->connect(url, user, password);
    db = driver->connect(options);

    db->setSchema(database);

    std::unique_ptr<sql::Statement> stmt(db->createStatement());
    stmt->execute("SET autocommit=0;");
    stmt->execute("SET unique_checks=0;");
    stmt->execute("DELETE FROM unfirebase;");
    stmt->execute("SET GLOBAL max_allowed_packet=10000000000;");
    stmt->execute("COMMIT;");

    insertUnfirebaseStatement = db->prepareStatement("INSERT INTO unfirebase VALUES (?, ?)");

    if (db->isValid()) {
      cout << "Connected to MySQL!" << endl;
    } else {
      cerr << "Failed to connect to MySQL!" << endl;
      return EXIT_FAILURE;
    }

    parseFirebaseJSON(filename);
  }
  catch (sql::SQLException &e)
  {
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
  if (getenv("MallocStackLogging"))
    system("leaks parse-firebase-json");

  return 0;
}