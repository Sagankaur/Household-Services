// src/store.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    userId: null,
    role: null,
    authToken: null,
    // loggedIn: false
  },
  mutations: {
    setUser(state, { userId, role, authToken }) {
      state.userId = userId
      state.role = role
      state.authToken = authToken
      // state.loggedIn = true
    },
    clearUser(state) {
      state.userId = null
      state.role = null
      state.authToken = null
      // state.loggedIn = false
    }
  },
  actions: {
    login({ commit }, { userId, role, authToken }) {
      commit('setUser', { userId, role, authToken })
    },
    logout({ commit }) {
      commit('clearUser')
    }
  },
  getters: {
    authToken: state => state.authToken,  // This should return the token
    isAuth: state => !!state.authToken,
    userRole: state => state.role,
    userId: state => state.userId
  }
})
