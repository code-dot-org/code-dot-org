/*jshint esversion: 6 */
const AWS = require("aws-sdk");
const mysql = require("mysql");
const { sendCfnResponse } = require("cfn-response");

const queryPromise = (connection, query) => {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

exports.handler = async (event, context) => {
  console.log("REQUEST RECEIVED:\n", JSON.stringify(event));

  const props = event.ResourceProperties;
  let secretsManager = new AWS.SecretsManager();
  let dbCredentialAdminSecretValue = await secretsManager
    .getSecretValue({ SecretId: props.DBCredentialAdminSecret })
    .promise();
  let dbCredentialSQLUserSecretValue = await secretsManager
    .getSecretValue({ SecretId: props.DBCredentialSecret })
    .promise();
  let physicalResourceId =
    event.PhysicalResourceId || dbCredentialSQLUserSecretValue.username;

  const connection = mysql.createConnection({
    host: props.DBServerHost,
    user: dbCredentialAdminSecretValue.username,
    password: dbCredentialAdminSecretValue.password,
    timeout: 10000,
  });

  try {
    let results;
    const clientHost = "%"; // Default to configuring all MySQL users to be able to connect from any (`%`) client.

    switch (event.RequestType) {
      case "Create":
      case "Update":
        results = await createOrUpdateSQLUser(connection, {
          name: dbCredentialSQLUserSecretValue.username,
          clientHost: clientHost,
          password: dbCredentialSQLUserSecretValue.password,
          databases: props.Databases,
          privileges: props.Privileges,
        });
        console.log(results.createUser); // Results from the CREATE USER query.
        console.log(results.updateUser); // Results from the UPDATE USER query.
        console.log(results.grantResults); // Array of results from each GRANT operation.
        break;
      case "Delete":
        results = await deleteSQLUser(connection, {
          name: props.Name,
          clientHost: clientHost,
        });
        console.log(results);
        break;
      default:
        throw new Error("Unsupported Resource Event type.");
    }

    await sendCfnResponse(event, context, "SUCCESS", {}, physicalResourceId);
  } catch (error) {
    console.error("Error:", error);
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

const createOrUpdateSQLUser = async (
  connection,
  { name, clientHost, password, databases, privileges }
) => {
  const createUser = `
        CREATE USER IF NOT EXISTS '${name}'@'${clientHost}'
        IDENTIFIED WITH mysql_native_password
        BY ${connection.escape(password)};
    `;
  const createResults = await queryPromise(connection, createUser);

  const updateUser = `
        ALTER USER '${name}'@'${clientHost}'
        IDENTIFIED WITH mysql_native_password
        BY ${connection.escape(password)};
    `;
  const updateResults = await queryPromise(connection, updateUser);

  const grantPromises = databases.map((database) => {
    const grantPrivileges = `
            GRANT ${privileges.join(",")}
            ON ${database}.*
            TO '${name}'@'${clientHost}';
        `;
    return queryPromise(connection, grantPrivileges);
  });

  const grantResultsArray = await Promise.all(grantPromises);

  return {
    createUser: createResults,
    updateUser: updateResults,
    grantResults: grantResultsArray,
  };
};

const deleteSQLUser = async (connection, { name, clientHost }) => {
  const dropUser = `DROP USER IF EXISTS '${name}'@'${clientHost}';`;
  return await queryPromise(connection, dropUser);
};
