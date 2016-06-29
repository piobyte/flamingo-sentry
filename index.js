const addon = require('flamingo/src/addon');
const raven = require('raven');
const bunyan = require('bunyan');

/**
 * sentry addon hooks
 * @module flamingo-sentry/index
 */

/**
 * Flamingo configuration
 * @external Config
 * @see {@link https://piobyte.github.io/flamingo/Config.html|flamingo Config}
 */

let ravenClient;

/**
 * Function to ensure that the the sentry `msg` field exists on the log object.
 * @param {object} obj sentry log object
 * @return {object} obj input object
 */
function ensureLogMessage(obj) {
  if (!obj.msg) {
    if (obj.request) {
      obj.msg = 'request error for: ' + obj.request.uri.href;
    }
  }

  return obj;
}

/**
 * Returns sentry environment mappings
 * @name ENV
 * @function
 * @example
 * `SENTRY_DSN` => `SENTRY_DSN`
 * @return {Array} environment mappings
 */
exports[addon.HOOKS.ENV] = function () {
  return [['SENTRY_DSN', 'SENTRY_DSN']];
};

/**
 * Returns default addon conf
 * @name CONF
 * @function
 * @return {{SENTRY_DSN: undefined}}
 */
exports[addon.HOOKS.CONF] = function () {
  return {
    SENTRY_DSN: undefined
  };
};


/**
 * Result of input reading
 * @typedef {{level: number, stream: {write: function}}} BunyanStreamDefinition
 * @property {number} level log level
 * @property {{write: function}} stream object where write function sends incoming messages to sentry via raven
 */

/**
 * Returns addon log streams builder function
 * @param {external:Config} conf
 * @name LOG_STREAM
 * @function
 * @see {@link bunyan.docs}
 * @return {Array.<BunyanStreamDefinition>} bunyan stream definitions
 */
exports[addon.HOOKS.LOG_STREAM] = function (conf) {
  const levels = {};
  levels[bunyan.DEBUG] = 'debug';
  levels[bunyan.INFO] = 'info';
  levels[bunyan.WARN] = 'warning';
  levels[bunyan.ERROR] = 'error';
  levels[bunyan.FATAL] = 'fatal';

  ravenClient = new raven.Client(conf.SENTRY_DSN);

  return [{
    level: bunyan.WARN,
    stream: {
      write: function (msg) {
        let obj = {};
        try {
          obj = ensureLogMessage(JSON.parse(msg));
        } catch (e) {
          obj.msg = 'Error parsing log message. This happens if bunyan creates an invalid JSON string. (In theory it should never happen)';
          obj.level = bunyan.FATAL;
        }
        obj.flamingo = {version: conf.VERSION};
        ravenClient.captureMessage(obj.msg, {
          level: levels[obj.level],
          extra: obj
        });
      }
    }
  }];
};
