import { createStore } from "vuex";

export default createStore({
  state: {
    username: null,
    issuer: null,
    webId: null,
    host: null,
    origin: null,
  },
  mutations: {
    setUsername(state, username) {
      state.username = username;
    },
    setIssuer(state, issuer) {
      state.issuer = issuer;
    },
    setWebId(state, webId) {
      state.webId = webId;
    },
    setHost(state, host) {
      state.host = host;
    },
    setOrigin(state, origin) {
      state.origin = origin;
    },
  },
  actions: {},
  getters: {
    getUsername(state) {
      return state.username;
    },
    getIssuer(state) {
      return state.issuer;
    },
    getOrigin(state) {
      return state.origin;
    },
    getWebId(state) {
      return state.webId;
    },
  },
  modules: {},
});
