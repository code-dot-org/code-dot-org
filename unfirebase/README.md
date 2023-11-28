# For MacOS:

## Edit mysql-connector-c++ to install jdbc.h
Need to edit the mysql-connector-c++ formula first (UGH! they don't include the jdbc bits required for an AWS RDS instance which doesn't support x plugin, used by the newer connector APIs 😥). See: https://docs.brew.sh/FAQ#can-i-edit-formulae-myself

1. export HOMEBREW_NO_INSTALL_FROM_API=1
2. `brew edit mysql-connector-c++`
3. Find this line: `system "cmake", "-S", ".", "-B", "build", "-DINSTALL_LIB_DIR=lib", *std_cmake_args`
4. Change it to: `system "cmake", "-S", ".", "-B", "build", "-DINSTALL_LIB_DIR=lib", "-DWITH_JDBC=ON", *std_cmake_args`
5. `brew reinstall --build-from-source mysql-connector-c++`
6. Verify the jdbc.h header is now installed: `ls /opt/homebrew/include/mysql/jdbc.h`
7. For docs on using the legacy jdbc.h API see: https://dev.mysql.com/doc/dev/connector-cpp/latest/jdbc_ref.html
8. 
## Build parse-json-firebase
1. `brew install rapidjson boost`
2. make
3. ./parse-firebase-json lil-prod.json

You can use the `get-latest-firebase-data.sh` script to fetch the latest backup from firebase.

