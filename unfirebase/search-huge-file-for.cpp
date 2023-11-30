#include <chrono>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <mutex>
#include <string>
#include <thread>

const uint64_t BLOCK_SIZE = 1048576;

using namespace std;
int main(int argc, char *argv[]) {
  if (argc != 2) {
    cout << "Really really really fast search for a fixed string in a huge file, gives byte offset" << endl;
    cout << "Usage: " << argv[0] << " SEARCH_STRING FILE" << endl;
    cout << "CAVEAT: reads the file in 1MB blocks, so in theory it might miss your string if it happens to span a block split" << endl;
    return 1;
  }

  string search = argv[1];
  string filename = argv[2];

  
  cout << "Searching for " << search << " in " << filename << endl;

  string block(BLOCK_SIZE, ' ');
  ifstream file(filename, ios::binary);

  uint64_t offset = 0;
  while (!file.eof()) {
    file.read(&block[0], BLOCK_SIZE);
    size_t pos = block.find(search);
    if (pos != string::npos) {
      offset += pos;

      file.close();
      file.open(filename);
      file.seekg(offset);
      file.read(&block[0], BLOCK_SIZE);
      cout << "Found at offset " << offset << endl;
      cout << endl;
      cout << "Context is: " << endl;
      cout << block << endl << endl;

      break;
    }

    offset += BLOCK_SIZE;

    if (offset % 1000000000 < BLOCK_SIZE) {
      cout << "Searched " << offset / 1000000000 << " GB" << endl;
    }
  }

  return 0;
}