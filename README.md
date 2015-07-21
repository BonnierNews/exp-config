exp-config
=========

[![Build Status](https://travis-ci.org/ExpressenAB/exp-config.svg?branch=master)](https://travis-ci.org/ExpressenAB/exp-config)

Loads configuration from JSON files from a `<app_root>/config` directory. The `NODE_ENV` environment variable determines which configuration file is loaded. It's also possible to override configuration values using a file named `.env` in `<app_root>` and by specifying them as environment variables.

You should use this module instead of using if/switch statements and the `NODE_ENV` environment variable directly. This will make your application easier to configure when it grows.

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
var config = require("exp-config");
var configuredValue = config.someProp;
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
var config = require("exp-config");
var configuredValue = config.server.host;
```

Booleans need special care:

```javascript
var config = require("exp-config");
if (config.boolean("flags.someFlag")) {
  ...
}
```

If you just use `config.flags.someFlag` to prevent the string `"false"` (which is truthy) to cause problems.


## Different configuration files for different environments

By default exp-config loads `<app_root>/config/development.json`. This behavior is typically used for local development and changed by specifying a different environment using the `NODE_ENV` environment variable, like this:

```
$ NODE_ENV=production node app
```

When starting an application in this way `exp-config` will instead load `<app_root>/config/production.json`. Likewise, it's common to have a separate configuration file for tests, and using `NODE_ENV=test` when running them.

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

### Precedence and values in tests

Values are loaded with the following precedence:

1. Environment variable
2. .env file
3. Configuration file

In other words, environment variables take precedence over `.env` files and configuration files. However, there is one exception. When `NODE_ENV` equals `test` (`NODE_ENV=test`) environment variables and `.env` files are ignored.

## Specifying the root folder

By default `exp-config` tries to locate the config folder and the (optional) `.env` file by using `process.cwd()`. This works great when starting the application from it's root folder. However, sometimes that's not possible. In such cases the root path can be specified by setting an environment variable named `CONFIG_BASE_PATH`, like this:

```
$ CONFIG_BASE_PATH=/home/someuser/myapp/ node /home/someuser/myapp/app.js
```

## Usage pattern

An application using `exp-config` typically have a directory structure like this:

```
.
├── .env <-- Overrides for local development, not committed to source control
├── config <-- Configuration files committed to source control
|   ├── development.json <-- default file, used during local development
|   ├── production.json <-- used in production by setting NODE_ENV
|   └── test.json <-- used in tests by setting NODE_ENV
└── app.js <-- the app
```
