var testUtils = require('../util/testUtils');
var assert = testUtils.assert;

// Simple console that only has 'log' method
var OldConsole = function () {
  var that = {
    transcript: ""
  };

  that.log = function (msg) {
    that.transcript += "LOG:" + msg + "\n";
  };

  return that;
};

// Modern console with log, info, warn, error methods.
var ModernConsole = function () {
  var that = OldConsole();

  that.log = function (msg) {
    that.transcript += "LOG:" + msg + "\n";
  };

  that.info = function (msg) {
    that.transcript += "INFO:" + msg + "\n";
  };

  that.warn = function (msg) {
    that.transcript += "WARN:" + msg + "\n";
  };

  that.error = function (msg) {
    that.transcript += "ERROR:" + msg + "\n";
  };

  return that;
};

var logMsg =   "Humpty Dumpty sat on a wall";
var infoMsg =  "Humpty Dumpty had a great fall";
var warnMsg =  "Then he picked himself up";
var errorMsg = "And went to lunch.";

describe("NetSimLogger", function () {
  var NetSimLogger = testUtils.requireWithGlobalsCheckBuildFolder('netsim/NetSimLogger');
  var LogLevel = NetSimLogger.LogLevel;

  it("is a complete no-op with no console defined", function () {
    var fauxConsole = {};
    var logger = new NetSimLogger(fauxConsole, LogLevel.VERBOSE);

    logger.info(infoMsg);
    logger.warn(warnMsg);
    logger.error(errorMsg);

    assert(fauxConsole.transcript === undefined);
  });

  it("pipes all output to 'log' on older consoles", function () {
    var fauxConsole = OldConsole();
    var logger = new NetSimLogger(fauxConsole, LogLevel.VERBOSE);

    logger.info(infoMsg);
    logger.warn(warnMsg);
    logger.error(errorMsg);

    assert(fauxConsole.transcript ===
        "LOG:" + infoMsg + "\n" +
        "LOG:" + warnMsg + "\n" +
        "LOG:" + errorMsg + "\n"
    );
  });

  it("directs output on modern consoles", function () {
    var fauxConsole = ModernConsole();
    var logger = new NetSimLogger(fauxConsole, LogLevel.VERBOSE);

    logger.info(infoMsg);
    logger.warn(warnMsg);
    logger.error(errorMsg);

    assert(fauxConsole.transcript ===
        "INFO:" + infoMsg + "\n" +
        "WARN:" + warnMsg + "\n" +
        "ERROR:" + errorMsg + "\n"
    );
  });

  it("log method defaults to INFO", function () {
    var fauxConsole = ModernConsole();
    var logger = new NetSimLogger(fauxConsole, LogLevel.VERBOSE);

    logger.log(logMsg);
    assert(fauxConsole.transcript === "INFO:" + logMsg + "\n");
  });

  it("log method respects info, error, warn settings", function () {
    var fauxConsole = ModernConsole();
    var logger = new NetSimLogger(fauxConsole, LogLevel.VERBOSE);

    logger.log(infoMsg, LogLevel.INFO);
    assert(fauxConsole.transcript === "INFO:" + infoMsg + "\n");

    fauxConsole.transcript = "";
    logger.log(warnMsg, LogLevel.WARN);
    assert(fauxConsole.transcript === "WARN:" + warnMsg + "\n");

    fauxConsole.transcript = "";
    logger.log(errorMsg, LogLevel.ERROR);
    assert(fauxConsole.transcript === "ERROR:" + errorMsg + "\n");
  });

  it("log method uses LOG endpoint for bad LogLevel argument", function () {
    var fauxConsole = ModernConsole();
    var logger = new NetSimLogger(fauxConsole, LogLevel.VERBOSE);

    logger.log(logMsg, 42);
    assert(fauxConsole.transcript === "LOG:" + logMsg + "\n");
  });

  it("Shows all messages at VERBOSE log level", function () {
    var fauxConsole = ModernConsole();
    var logger = new NetSimLogger(fauxConsole, LogLevel.VERBOSE);

    logger.info(infoMsg);
    logger.warn(warnMsg);
    logger.error(errorMsg);

    assert(fauxConsole.transcript ===
        "INFO:" + infoMsg + "\n" +
        "WARN:" + warnMsg + "\n" +
        "ERROR:" + errorMsg + "\n"
    );
  });

  it("Shows all messages at INFO log level", function () {
    var fauxConsole = ModernConsole();
    var logger = new NetSimLogger(fauxConsole, LogLevel.INFO);

    logger.info(infoMsg);
    logger.warn(warnMsg);
    logger.error(errorMsg);

    assert(fauxConsole.transcript ===
        "INFO:" + infoMsg + "\n" +
        "WARN:" + warnMsg + "\n" +
        "ERROR:" + errorMsg + "\n"
    );
  });

  it("Omits info messages at WARN log level", function () {
    var fauxConsole = ModernConsole();
    var logger = new NetSimLogger(fauxConsole, LogLevel.WARN);

    logger.info(infoMsg);
    logger.warn(warnMsg);
    logger.error(errorMsg);

    assert(fauxConsole.transcript ===
        "WARN:" + warnMsg + "\n" +
        "ERROR:" + errorMsg + "\n"
    );
  });

  it("Omits info and warn messages at ERROR log level", function () {
    var fauxConsole = ModernConsole();
    var logger = new NetSimLogger(fauxConsole, LogLevel.ERROR);

    logger.info(infoMsg);
    logger.warn(warnMsg);
    logger.error(errorMsg);

    assert(fauxConsole.transcript ===
        "ERROR:" + errorMsg + "\n"
    );
  });

  it("Omits all messages at NONE log level", function () {
    var fauxConsole = ModernConsole();
    var logger = new NetSimLogger(fauxConsole, LogLevel.NONE);

    logger.info(infoMsg);
    logger.warn(warnMsg);
    logger.error(errorMsg);

    assert(fauxConsole.transcript === "");
  });
});
