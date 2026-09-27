/**
 * Development shim for the browser storage API the prototype uses.
 *
 * The prototype stores everything in the browser so you can click through the
 * whole product without a backend. That is deliberate — it is a specification
 * you can interact with, not the production data layer.
 *
 * Replace this with real API calls to your Next.js routes as you build each
 * feature (see docs/production-integration.md). Delete this file once nothing
 * imports it.
 *
 * Note: localStorage caps out around 5 MB. Uploading several certificates in
 * the prototype will hit that limit. That is expected — production stores
 * files in Cloudflare R2, not in the browser.
 */
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      if (value === null) throw new Error(`Key not found: ${key}`);
      return { key, value, shared: false };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value, shared: false };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      return { keys, prefix, shared: false };
    },
  };
}

export default true;
