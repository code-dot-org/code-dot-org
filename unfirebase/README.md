# For MacOS:

## Edit mysql-connector-c++ to install jdbc.h
Need to edit the mysql-connector-c++ formula first (UGH! they don't include the jdbc bits required for an AWS RDS instance which doesn't support x plugin, used by the newer connector APIs 😥, edits are based off parallel in freebsd ports: https://cgit.freebsd.org/ports/commit/?id=adcb80f3fa92f9f25c3aa84fc4b1e1e79919acc0). 

See: https://docs.brew.sh/FAQ#can-i-edit-formulae-myself

1. export HOMEBREW_NO_INSTALL_FROM_API=1
2. `brew edit mysql-connector-c++`
3. Find this line: `system "cmake", "-S", ".", "-B", "build", "-DINSTALL_LIB_DIR=lib", *std_cmake_args`
4. Change it to: `system "cmake", "-S", ".", "-B", "build", "-DINSTALL_LIB_DIR=lib", "-DWITH_JDBC=ON", *std_cmake_args`
5. `brew reinstall --build-from-source mysql-connector-c++`
6. Verify the jdbc.h header is now installed: `ls /opt/homebrew/include/mysql/jdbc.h`
7. For docs on using the legacy jdbc.h API see: https://dev.mysql.com/doc/dev/connector-cpp/latest/jdbc_ref.html

## Install mac deps
1. `brew install rapidjson boost`


# For Linux:

## Install linux deps
1. `apt-get install clang rapidjson-dev libboost-iostreams-dev build-essential libboost-system-dev`

## Same problem, need to build from source to get -DWITH_JDBC=ON
1. `git clone https://github.com/mysql/mysql-connector-cpp.git`
2. cd mysql-connector-cpp
3. `cmake -DCMAKE_INSTALL_LIBDIR=lib -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX:PATH=/usr/local -DWITH_JDBC=ON .`
4. `cmake --build .`
5. `sudo cmake --build . --target install`
6. This is super annoying but I haven't figured out how to fix it with proper build args to the cmake, and this is limited use so here's the hack: `sudo mv /usr/local/lib64/libmysqlcppconn* /usr/local/lib`
7. `sudo ldconfig`


# For everyone:

You can use the `get-latest-firebase-data.sh` script to fetch the latest backup from firebase.

1. make
2. ./parse-firebase-json lil-prod.json