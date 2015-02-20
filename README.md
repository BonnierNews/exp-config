exp-config
=========

Loads configuration from JSON files from a [app_root]/config directory. The loaded configuration file can differ depending on the environment (determined by the NODE_ENV environment variable). It's also possible to override configuration values using a file named .env in [app_root] and by specifying them as environment variables.

## Basic usage

```
npm install exp-config
```

Create file named development.json in a folder named config in the application's root directory, such as:

```
{
  "someProp": "some value"
}
```

In your code require exp-config an retrieve the configuration value:


```javascript
var config = require("exp-config");
var configuredValue = config.someProp;
```

You can also nest properties in the configuration files:

```
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