var addon = require('flamingo/src/addon');
var raven = require('raven');
var bunyan = require('bunyan');

var ravenClient;

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

exports[addon.HOOKS.ENV] = function () {
  return [['SENTRY_DSN', 'SENTRY_DSN']];
};

exports[addon.HOOKS.CONF] = function () {
  return {
    SENTRY_DSN: undefined
  };
};

exports[addon.HOOKS.LOG_STREAM] = function (conf) {
  var levels = {};
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
        var obj = {};
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
