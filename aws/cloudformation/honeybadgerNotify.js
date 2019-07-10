// Uses API key from HONEYBADGER_API_KEY env variable
const Honeybadger = require("honeybadger");

const handler = async (event, context) => {
  try {
    const message = event.Records[0].Sns.Message;
    Honeybadger.notify(JSON.parse(message));
    console.log("Successfully notified Honeybadger for message: " + message);
  } catch (error) {
    console.error(
      "Failed to parse and notify Honeybadger, falling back to sending entire payload",
      error
    );
    Honeybadger.notify({
      name: "Honeybadger Lambda failed to notify",
      message: JSON.stringify(event)
    });
  }

  return "success";
};

exports.handler = Honeybadger.lambdaHandler(handler);
