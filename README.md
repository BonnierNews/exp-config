# exp-config

![](https://github.com/ExpressenAB/exp-config/workflows/Run%20tests/badge.svg)

Loads configuration from JSON files from a `<app_root>/config` directory. The `NODE_ENV` environment variable determines which configuration file is loaded. Settings that are shared between environments can be put in the optional `default.json`. Variables loaded from the environment files take precedence over the default.

It's also possible to override configuration values using a file named `.env` in `<app_root>` and by specifying them as environment variables.

You should use this module instead of using if/switch statements and the `NODE_ENV` environment variable directly. This will make your application easier to configure when it grows.

# NPM Versions

For node versions below 4 please use v1.3.4 - `npm i -S exp-config@1.3.4`.

## Basic usage

```
npm install exp-config
```

Create a file named `development.json` in a folder named config in the application's root directory, such as:

```json
{
  "someProp": "some value"
}
```

In your code require `exp-config` and retrieve the configuration value:

```javascript
const config = require("exp-config");
const configuredValue = config.someProp;
```

You can also nest properties in the configuration files:

```json
{
  "server": {
    "host": "google.com"
  }
}
```

```javascript
const config = require("exp-config");
const configuredValue = config.server.host;
```

Booleans may need special care:

```javascript
const config = require("exp-config");
if (config.boolean("flags.someFlag")) {
  ...
}
```

This is to prevent `config.flags.someFlag` having the value `"false"` (which is truthy) to cause problems.

## Different configuration files for different environments

By default exp-config loads `<app_root>/config/development.json`. This behavior is typically used for local development and changed by specifying a different environment using the `NODE_ENV` environment variable, like this:

```
$ NODE_ENV=production node app
```

When starting an application in this way `exp-config` will instead load `<app_root>/config/production.json`. Likewise, it's common to have a separate configuration file for tests, and use `NODE_ENV=test` when running them.

### NODE_CONFIG_ENV

In some cases you want or need to use `NODE_ENV=production` to get for instance performance benfits in [Express.js](https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production). But we still want load specific configuration for an evironment you can use `NODE_CONFIG_ENV` to use for configuration identification.

```
NODE_ENV=production NODE_CONFIG_ENV=qa node app
```

The `qa` configuration would be used instead of the `production` configuration.

## Overriding configuration values

Individual values in the loaded configuration can be overridden by placing a file named `.env` in the application's root (`<app_root>/.env`). An example `.env` file can look like this:

```
someProp=some other value
server.host=example.com
flags.someFlag=true

# The .env file can contain comments which is nice
# when you want to easily switch between values
#server.host=prod.example.com
#server.host=stage.example.com
#server.host=test.example.com
```

If you use [nodemon](http://nodemon.io/) to automatically restart your app while developing, you should add `"watch": ["*", ".env"]` to your `nodemon.json` file so that the app is restarted whenever you change your `.env` file.

It's also possible to override configuration by specifying them as environment variables when starting the application, like this:

```
$ someProp=value node app
```

To override nested properties with environment variables do like this:

```
$ env 'flags.someFlag=false' node .
```

### Specifying other .env file

By default `exp-config` uses a file called `.env` in the root folder, you can override this by setting an environment variable named `ENV_PATH` to the new files path and name. NOTE: this is relative to the projects root folder.

```
$ ENV_PATH=relative/env/path/.envfile node /home/someuser/myapp/app.js
```

### Precedence and values in tests

Values are loaded with the following precedence:

1. Environment variable
2. .env file
3. Configuration file

In other words, environment variables take precedence over `.env` files and configuration files.

_NOTE, there is one exception_: When `NODE_ENV` equals `test` (`NODE_ENV=test`) the `.env` file and environment variables are ignored. We want the test process to be as isolated and repeatable as possible, and are therefore minimizing the possibility of sticky human fingers messing with its configuration.

_NOTE II, exception to the exception_: If you want environment variables to be honored in the `test` environment, you can set the `ALLOW_TEST_ENV_OVERRIDE` environment variable. This is useful for overriding certain configurations when doing in-container testing. The `.env` file will still be ignored however.

### When periods are not allowed in environment variables

In openshift and some versions of alpine, you are not allowed to set environvariables with periods (".") in them. To solve this exp-config allows you to set `INTERPRET_CHAR_AS_DOT` to any char you like to be interpret as a period. Setting `INTERPRET_CHAR_AS_DOT=_` and `foo_baz_bar="value"` will set the value `foo.baz.bar` to `"value"` as long as `foo.baz.bar` it exists in the config-file.

## Specifying the root folder

By default `exp-config` tries to locate the config folder and the (optional) `.env` file by using `process.cwd()`. This works great when starting the application from it's root folder. However, sometimes that's not possible. In such cases the root path can be specified by setting an environment variable named `CONFIG_BASE_PATH`, like this:

```
$ CONFIG_BASE_PATH=/home/someuser/myapp/ node /home/someuser/myapp/app.js
```

## Specifying a bash variable prefix

By default `exp-config` allows the values to be overriden by bash variables. Setting the `ENV_PREFIX` enables you to override your variables even if they are injected with a prefix. For example, if your environment makes s3 settings accessible for you via the bash variables `S3_key`, `S3_secret` and `S3_bucket`, and you want to override the settings for `key`, `secret` and `bucket` in your config file, setting `ENV_PREFIX=S3_` allows you to do this.

```
$ ENV_PREFIX=S3_ node /home/someuser/myapp/app.js
```

## Usage pattern

An application using `exp-config` typically have a directory structure like this:

```
.
├── .env <-- Overrides for local development, not committed to source control
├── config <-- Configuration files committed to source control
|   ├── development.json <-- used during local development, loaded if NODE_ENV is unset
|   ├── production.json <-- used in production by setting NODE_ENV
|   └── test.json <-- used in tests by setting NODE_ENV
|   └── default.json <-- shared settings, optional
└── app.js <-- the app
```
