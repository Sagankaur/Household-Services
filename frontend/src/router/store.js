// // src/store.js
// import { createStore } from 'vuex'

// export default createStore({
//   state: {
//     userId: null,
//     role: null,
//     authToken: null,
//     // loggedIn: false
//   },
//   mutations: {
//     setUser(state, { userId, role, authToken }) {
//       state.userId = userId
//       state.role = role
//       state.authToken = authToken
//       // state.loggedIn = true
//       localStorage.setItem('userId', userId)
//       localStorage.setItem('role', role)
//       localStorage.setItem('authToken', authToken)
//     },
//     clearUser(state) {
//       state.userId = null
//       state.role = null
//       state.authToken = null
//       // state.loggedIn = false
//       localStorage.removeItem('userId')
//       localStorage.removeItem('role')
//       localStorage.removeItem('authToken')
//       localStorage.clear(); 
//     }
//   },
//   actions: {
//     login({ commit }, { userId, role, authToken }) {
//       commit('setUser', { userId, role, authToken })
//     },
//     logout({ commit }) {
//       commit('clearUser')
//     }
//   },
//   getters: {
//     authToken: state => state.authToken,  // This should return the token
//     isAuth: state => !!state.authToken,
//     userRole: state => state.role,
//     userId: state => state.userId
//   }
// })

import { createStore } from 'vuex';

export default createStore({
  state: {
    userId: localStorage.getItem('userId') || null,
    role: localStorage.getItem('role') || null,
    authToken: localStorage.getItem('authToken') || null,
  },
  mutations: {
    setUser(state, { userId, role, authToken }) {
      state.userId = userId;
      state.role = role;
      state.authToken = authToken;
      
      // Save to local storage
      localStorage.setItem('userId', userId);
      localStorage.setItem('role', role);
      localStorage.setItem('authToken', authToken);
    },
    clearUser(state) {
      state.userId = null;
      state.role = null;
      state.authToken = null;

      // Remove from local storage
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.removeItem('authToken');
    }
  },
  actions: {
    login({ commit }, { userId, role, authToken }) {
      commit('setUser', { userId, role, authToken });
    },
    logout({ commit }) {
      commit('clearUser');
    }
  },
  getters: {
    authToken: state => state.authToken,
    isAuth: state => !!state.authToken,
    userRole: state => state.role,
    userId: state => state.userId
  }
});
