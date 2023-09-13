/*jshint esversion: 6 */
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");
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
  const secretsClient = new SecretsManagerClient();
  const getAdminSecretCommand = new GetSecretValueCommand({
    SecretId: props.DBCredentialAdminSecret,
  });
  const adminSecretResponse = await secretsClient.send(getAdminSecretCommand);
  const getSQLUserSecretCommand = new GetSecretValueCommand({
    SecretId: props.DBCredentialSecret,
  });
  const sqlUserSecretResponse = await secretsClient.send(
    getSQLUserSecretCommand
  );
  const dbCredentialAdmin = JSON.parse(adminSecretResponse.SecretString);
  const dbCredentialSQLUser = JSON.parse(sqlUserSecretResponse.SecretString);

  let physicalResourceId =
    event.PhysicalResourceId || dbCredentialSQLUser.username;

  const connection = mysql.createConnection({
    host: props.DBServerHost,
    user: dbCredentialAdmin.username,
    password: dbCredentialAdmin.password,
    connectTimeout: 10000,
  });

  console.log("Created database connection.");

  try {
    let results;
    const clientHost = "%"; // Default to configuring all MySQL users to be able to connect from any (`%`) client.

    switch (event.RequestType) {
      case "Create":
      case "Update":
        results = await createOrUpdateSQLUser(connection, {
          name: dbCredentialSQLUser.username,
          clientHost: clientHost,
          password: dbCredentialSQLUser.password,
          privileges: props.Privileges,
        });
        console.log(results.createUser); // Results from the CREATE USER query.
        console.log(results.updateUser); // Results from the UPDATE USER query.
        console.log(results.grantResults); // Array of results from each GRANT operation.
        break;
      case "Delete":
        results = await deleteSQLUser(connection, {
          name: dbCredentialSQLUser.username,
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
  { name, clientHost, password, privileges }
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

  const databases = ["pegasus", "dashboard"];

  const grantPromises = databases.map((database) => {
    // The Rails ("Dashboard") and Sinatra ("Pegasus") database names can potentially be `dashboard`,
    // `dashboard_[environment type]` or on the managed test server, numbered to support parallel execution of unit
    // tests (`dashboard_test1`, `dashboard_test2`, etc. so grant permissions to `dashboard%.*` and `pegasus%.*`.
    // Don't grant permissions to `*.*` because that would give access to the internal `mysql` database.
    // In MySQL, backticks (`) appears to be the only way to quote a database name with a wildcard.
    const grantPrivileges = `
            GRANT ${privileges.join(",")}
            ON \`${database}%\`.*
            TO \`${name}\`@\`${clientHost}\`;
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
