const Server = require('flamingo/src/model/server');
const Config = require('flamingo/config');
const Loader = require('flamingo/src/addon/loader');
const Route = require('flamingo/src/model/route');
const got = require('got');
const path = require('path');
const assert = require('assert');
const mockery = require('mockery');

describe('LOG_STREAM', function () {
  before(function () {
    mockery.enable();
    mockery.warnOnUnregistered(false);
  });
  after(function () {
    mockery.disable();
  });

  it('calls Raven.captureMessage', function () {
    let capturedError = false;
    const config = () => ({install(){}});
    const captureMessage = (message, data) => {
      if (data.level === 'error') {
        capturedError = true;
      }
    };
    mockery.registerMock('raven', {
      config,
      captureMessage,
    });

    const loader = new Loader(path.join(__dirname, '../'), {});
    const addon = {
      path: path.join(__dirname, '../..'),
      pkg: require('../../package.json')
    };
    return Config.fromEnv().then(config => {
      const reduced = loader.reduceAddonsToHooks([loader.resolvePkg(addon)], loader._hooks);
      loader.finalize(reduced);

      class ErrorRoute extends Route {
        constructor(config, method = 'GET', path = '/', description = 'Index route that errors') {
          super(config, method, path, description);
        }

        handle() {
          // don't try this at home
          JSON.parse('o hai');
          return Promise.resolve('¯\\_(ツ)_/¯');
        }
      }

      let _server;
      config.PORT = 9912;
      return new Server(config, loader)
        .withProfiles([])
        .withRoutes([new ErrorRoute(config)])
        .start()
        .then(server => {
          _server = server;

          return got(`http://localhost:${config.PORT}/`).catch(e => e);
        }).then(error => {
          assert.equal(error.statusCode, 500);
          assert.ok(capturedError, 'called captureMessage on the raven client');
        })
        .finally(() => _server.stop());
    });
  });
});
