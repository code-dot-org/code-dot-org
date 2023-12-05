ifeq ($(shell uname),Linux)
BOOST_THREAD_LIB += -lboost_thread
endif

ifeq ($(shell uname),Darwin)
BOOST_THREAD_LIB += -lboost_thread-mt
endif

all: parse-firebase-json search-huge-file-for


parse-firebase-json: parse-firebase-json.cpp Makefile munged-reader.h
	clang++ -O3 -std=c++17 -g -pthread -L /usr/local/lib -L /opt/homebrew/lib -I /opt/homebrew/include/ -o parse-firebase-json parse-firebase-json.cpp -lboost_system -lboost_iostreams $(BOOST_THREAD_LIB) -lmysqlcppconn

search-huge-file-for: search-huge-file-for.cpp Makefile
	clang++ -O3 -std=c++17 -g search-huge-file-for.cpp -o search-huge-file-for
