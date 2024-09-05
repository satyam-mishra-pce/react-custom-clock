/**
 * Returns true if a variable is an object.
 */
const isObject = (value: any): value is object => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof RegExp) &&
    !(value instanceof Date) &&
    !(value instanceof Set) &&
    !(value instanceof Map)
  );
};

/**
 * Fills a given object (`userObj`) with default object (`defaultObj`) for the undefined or optional keys, and returns the new object.
 */
export const defaultFill = <T>(defaultObj: T, userObj: any) => {
  let newObject: T = structuredClone(defaultObj);
  if (isObject(defaultObj) && isObject(userObj)) {
    for (const key in defaultObj) {
      if (
        key in userObj &&
        userObj[key as keyof typeof userObj] !== undefined
      ) {
        const defaultVal = defaultObj[key];
        const userVal = userObj[key as keyof typeof userObj];
        if (typeof defaultVal !== typeof userVal) {
          console.warn(
            `Bad key-value pair encountered:`,
            { key: userVal },
            `\nUsing default value.`
          );
          continue;
        }
        if (isObject(defaultVal)) {
          newObject[key] = defaultFill(defaultVal, userVal);
          continue;
        }
        newObject[key] = userVal;
      }
    }
  }
  return newObject;
};
