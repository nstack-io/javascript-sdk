const UUID_KEY = "nstack-uuid";

/** Get the UUID from localStorage or generate new one */
export const getUUID = () => {
  try {
    // try to get the uuid
    let uuid = localStorage.getItem(UUID_KEY);

    // if it doesn't exist or is not the expected length
    // then generate a new one
    if (uuid == null || uuid.length !== 36) {
      uuid = uuidv4();
      localStorage.setItem(UUID_KEY, uuid);
    }

    return uuid;
  } catch (e) {
    // localStorage did not work for some reason
    // fallback to just return a newly generated UUID
    return uuidv4();
  }
};

/** Generate UUID for nstack */
const uuidv4 = () => {
  return ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/1|0/g, function() {
    return (0 | (Math.random() * 16)).toString(16);
  });
};
