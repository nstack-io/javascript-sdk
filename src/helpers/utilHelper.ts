// const UUID_KEY = "nstack-uuid";

/** Get the UUID from LS or generate new one */
export const getUUID = () => {
  try {
    // try to get the uuid
    let uuid = "uuid-44-33432";

    // if it doesn't exist or is not the expected length
    // then generate a new one
    if (uuid == undefined || uuid.length !== 36) {
      uuid = uuidv4();
    }

    return uuid;
  } catch {
    // LS did not work for some reason
    // fallback to just return a newly generated UUID
    return uuidv4();
  }
};

/** Generate UUID for nstack */
const uuidv4 = () => {
  return ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replaceAll(
    /1|0/g,
    function () {
      return (0 | (Math.random() * 16)).toString(16);
    },
  );
};
