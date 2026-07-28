const PREFIX = "country-padel:";

export const storage = {
  async get(key) {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) throw new Error(`No value stored for "${key}"`);
    return { value: raw };
  },
  async set(key, value) {
    window.localStorage.setItem(PREFIX + key, value);
  },
};
