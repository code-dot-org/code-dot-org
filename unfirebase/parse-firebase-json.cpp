#include <assert.h>
#include <iostream>
#include <fstream>
#include <string>

using namespace std;

#include <rapidjson/reader.h>
#include <rapidjson/filereadstream.h>
#include <rapidjson/istreamwrapper.h>

using namespace rapidjson;

// #include <mysqlx/xdevapi.h>

// using namespace mysqlx;

// Client cli("user:password@host_name/db_name", ClientOption::POOL_MAX_SIZE, 7);
// Session sess = cli.getSession();

// // use Session sess as usual
// cli.close(); // close all Sessions

string lastKey = "";
uint depth = 0;

const bool RAW_DEBUG = false;
const bool FINE_DEBUG = true;
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

void startChannel(string channelName) {
  assert(currentChannelName == NO_CHANNEL);

  if (FINE_DEBUG)
    cout << "START CHANNEL " << channelName << endl;
  currentChannelName = channelName;
}

void endChannel() {
  assert(currentChannelName != NO_CHANNEL);

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

    return true;
  }
  bool Key(const char *key, SizeType length, bool copy)
  {
    if (RAW_DEBUG) cout << "Key(" << key << ", depth=" << depth << ")" << endl;
    lastKey = key;
    lastKeys[depth] = key;

    return true;
  }
  bool EndObject(SizeType memberCount)
  {
    if (RAW_DEBUG) cout << "EndObject(" << memberCount << ")" << endl;

    if (depth == CHANNEL_DEPTH && lastKeys[CHANNELS_DEPTH-1] == CHANNELS_TOKEN) {
      endChannel();
    }
    lastKeys[depth] = string();
    depth--;
    return true;
  }
  bool StartArray()
  {
    if (RAW_DEBUG) cout << "StartArray()" << endl;
    return true;
  }
  bool EndArray(SizeType elementCount)
  {
    if (RAW_DEBUG) cout << "EndArray(" << elementCount << ")" << endl;
    return true;
  }
  bool Null()
  {
    if (RAW_DEBUG) cout << "Null()" << endl;
    return true;
  }
  bool Bool(bool b)
  {
    if (RAW_DEBUG) cout << "Bool(" << boolalpha << b << ")" << endl;
    return true;
  }
  bool Int(int i)
  {
    if (RAW_DEBUG) cout << "Int(" << i << ")" << endl;
    return true;
  }
  bool Uint(unsigned u)
  {
    if (RAW_DEBUG) cout << "Uint(" << u << ")" << endl;
    return true;
  }
  bool Int64(int64_t i)
  {
    if (RAW_DEBUG) cout << "Int64(" << i << ")" << endl;
    return true;
  }
  bool Uint64(uint64_t u)
  {
    if (RAW_DEBUG) cout << "Uint64(" << u << ")" << endl;
    return true;
  }
  bool Double(double d)
  {
    if (RAW_DEBUG) cout << "Double(" << d << ")" << endl;
    return true;
  }
  bool RawNumber(const char *str, SizeType length, bool copy)
  {
    if (RAW_DEBUG) cout << "Number(" << str << ", " << length << ", " << boolalpha << copy << ")" << endl;
    return true;
  }
  bool String(const char *str, SizeType length, bool copy)
  {
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

int main(int argc, char *argv[])
{
  if (argc != 2) {
    cout << "Usage: " << argv[0] << " <json file>" << endl;
    return 1;
  }

  string filename = argv[1];
  cout << "parsing: " << filename << endl;

  RawJSONHandler handler;
  Reader reader;

  if (ends_with(filename, ".gz")) {
    cerr << "WARNING: parsing gzipped file, this will be 2x slower due to rapidjson details" << endl;
    ifstream jsonFile(filename, ios::binary);
    boost::iostreams::filtering_istreambuf inbuf;
    inbuf.push(boost::iostreams::gzip_decompressor());
    inbuf.push(jsonFile);
    istream gzipStream(&inbuf);

    // ifstream ifs(filename);
    IStreamWrapper isw(gzipStream);

    reader.Parse(isw, handler);
  } else {
    FILE *fp = fopen(filename.c_str(), "r");

    char readBuffer[65536];
    FileReadStream is(fp, readBuffer, sizeof(readBuffer));
    reader.Parse(is, handler);
  }

  // If you launch like:
  // `MallocStackLogging=1 ./parse lil-prod.json`
  // Then we invoke the `leaks` command to report memory leaks at the end.
  if (getenv("MallocStackLogging"))
    system("leaks parse-firebase-json");

  return 0;
}