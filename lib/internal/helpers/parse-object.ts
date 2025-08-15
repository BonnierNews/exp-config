import { Delimiter } from "../constants.js";
import unflattenObject from "../../helpers/unflatten-object.js";
import type { ApiArgs } from "../../create-config.js";

const parseObject = (params: ApiArgs & {
    allowedKeys: Set<string>
    obj: Record<string, unknown>,
}): { allow: Record<string, unknown>, excluded: Record<string, unknown> } => {
  const delimiter = params.delimiter || Delimiter;

  return Object.entries(params.obj)
    .sort(([ a ], [ b ]) => a.indexOf(".") - b.indexOf("."))
    .reduce((prev, [ argKey, argValue ]) => {
      let key = argKey;
      let keyToValidate = argKey;
      let value = argValue;

      if (typeof value === "string" && /^(true|false)$/i.test(value)) {
        value = value.toLowerCase() === "true";
      }

      if (params.envPrefix) {
        key = key.replace(params.envPrefix, "");
        keyToValidate = key;
      }

      if (params.interpretCharAsDot) {
        key = key.replace(new RegExp(params.interpretCharAsDot, "g"), delimiter);
        keyToValidate = key;
      }

      if (key.includes(delimiter)) {
        const translatedKeys = key.split(delimiter);
        key = translatedKeys[0];
        value = unflattenObject({ [translatedKeys.slice(1).join(delimiter)]: value }, delimiter);
      }

      if (!params.allowedKeys.has(keyToValidate)) {
        prev.excluded[argKey] = typeof value === "boolean" ? value : argValue;
      } else {
        prev.allow[key] = value;
      }

      return prev;
    }, { allow: {}, excluded: {} } as ReturnType<typeof parseObject>);
};

export { parseObject };
