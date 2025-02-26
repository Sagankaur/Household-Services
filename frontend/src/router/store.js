import { createStore } from 'vuex';

const store = createStore({
  state: {
    // User authentication data
    auth_token: null,
    role: null,
    loggedIn: false,
    userId: null,
    user: null, // Ensure user is properly defined
  },
  mutations: {
    // Mutation to set authentication token
    setAuthToken(state, token) {
      state.auth_token = token;
    },
    // Mutation to set user role
    setUserRole(state, role) {
      state.role = role;
    },
    // Mutation to update login status
    setLoggedIn(state, status) {
      state.loggedIn = status;
    },
    // Mutation to store user information
    setUser(state, user) {
      state.user = user;
    },
    setUserId(state, userId) {
      state.userId = userId;
    },
    // Mutation to clear authentication
    logout(state) {
      state.auth_token = null;
      state.role = null;
      state.loggedIn = false;
      state.user = null;
      state.userId = null;
    }
  },
  actions: {
    // Action to login user and store authentication details
    login({ commit }, userData) {
      commit('setAuthToken', userData.token);
      commit('setUserRole', userData.role);
      commit('setLoggedIn', true);
      commit('setUser', userData.user);
      commit('setUserId', userData.userId);
    },
    // Action to logout user
    logout({ commit }) {
      commit('logout');
    }
  },
  getters: {
    // Getter to check if the user is authenticated
    isAuthenticated: state => !!state.auth_token,
    // Getter for user role
    userRole: state => state.role,
    // Getter for logged-in user data
    getUser: state => state.user,
    userId: state => state.userId,
  }
});

export default store;
