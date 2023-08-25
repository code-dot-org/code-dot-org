const mysql = require("mysql");
const { sendCfnResponse } = require("./common/cfn-response");

exports.handler = async (event, context) => {
  // TODO: Mask password fields.
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));

  const props = event.ResourceProperties;
  const {
    Name: name,
    ClientHost: clientHost,
    Password: password,
    Databases: databases,
    Privileges: privileges,
  } = props;

  let physicalResourceId = event.PhysicalResourceId || name;

  const connection = mysql.createConnection({
    host: props.DBServerHost,
    user: props.DBAdminUsername,
    password: props.DBAdminPassword,
    timeout: 10000,
  });

  try {
    switch (event.RequestType) {
      case "Create":
      case "Update":
        await createOrUpdateSQLUser(connection, {
          name,
          clientHost,
          password,
          databases,
          privileges,
        })
          .then((results) => {
            console.log(results.createUser); // Results from the CREATE USER query.
            console.log(results.updateUser); // Results from the UPDATE USER query.
            console.log(results.grantResults); // Array of results from each GRANT operation.
          })
          .catch((error) => {
            console.error("Error creating/updating SQL user:", error);
            // TODO: Throw the error again here?
          });
        break;
      case "Delete":
        await deleteSQLUser(connection, { name, clientHost });
        break;
      default:
        throw new Error("Unsupported Resource Event type.");
    }

    await sendCfnResponse(event, context, "SUCCESS", {}, physicalResourceId);
  } catch (error) {
    await sendCfnResponse(
      event,
      context,
      "FAILURE",
      {},
      physicalResourceId,
      error.message
    );
  } finally {
    connection.end();
  }
};

const createOrUpdateSQLUser = (
  connection,
  { name, clientHost, password, databases, privileges }
) => {
  return new Promise((resolve, reject) => {
    const createUser = `
            CREATE USER IF NOT EXISTS '${name}'@'${clientHost}'
            IDENTIFIED WITH mysql_native_password
            BY ${connection.escape(password)};
        `;

    connection.query(createUser, (err, createResults) => {
      if (err) return reject(err);

      const updateUser = `
                ALTER USER '${name}'@'${clientHost}'
                IDENTIFIED WITH mysql_native_password
                BY ${connection.escape(password)};
            `;

      connection.query(updateUser, (err, updateResults) => {
        if (err) return reject(err);

        const promises = databases.map((database) => {
          return new Promise((resolve, reject) => {
            const grantPrivileges = `
                            GRANT ${privileges.join(",")}
                            ON ${database}.*
                            TO '${name}'@'${clientHost}';
                        `;

            connection.query(grantPrivileges, (err, grantResults) => {
              if (err) return reject(err);
              resolve(grantResults);
            });
          });
        });

        Promise.all(promises)
          .then((grantResultsArray) => {
            resolve({
              createUser: createResults,
              updateUser: updateResults,
              grantResults: grantResultsArray,
            });
          })
          .catch(reject);
      });
    });
  });
};

const deleteSQLUser = (connection, { name, clientHost }) => {
  return new Promise((resolve, reject) => {
    const dropUser = `DROP USER IF EXISTS '${name}'@'${clientHost}';`;

    connection.query(dropUser, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
