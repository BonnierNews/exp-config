# Changelog

## 5.0.0

- **Breaking:** removed the implicit `development` default for the environment. `NODE_ENV` or
  `NODE_CONFIG_ENV` must now be set explicitly; requiring `exp-config` without an environment
  throws `exp-config: environment must be explicitly set via NODE_CONFIG_ENV or NODE_ENV`.
- **Breaking:** requires Node.js 14 or later
- The environment name read from `NODE_CONFIG_ENV` / `NODE_ENV` is trimmed.

## 4.2.1

- Fixed module name in `index.d.ts`.
- Bumped deps.

## 4.2.0

Added support for `NODE_CONFIG_ENV`.
