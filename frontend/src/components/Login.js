export default {
  name:'Login',
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
      loading: false,
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.errorMessage = "";
      console.log("Username before sending:", this.username);


      try {
        // const user = {
        //   username: this.username,
        //   password: this.password,
        // };

        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: this.username, password: this.password }),
        });
        console.log('Payload:', JSON.stringify({ username: this.username, password: this.password }));

        if (!response.ok) {
          throw new Error(response.statusText);
        }

        const data = await response.json();

        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('userId', data.id);
          localStorage.setItem('user', JSON.stringify(data));

          this.$store.commit('setUser',data)
          // commit('setAuthToken', userData.token);
          // commit('setUserRole', userData.role);
          // commit('setLoggedIn', true);
          
          if (data.role === 'admin') {
            this.$router.push(`/home_admin/${data.id}`);
          } else if (data.role === "professional") {
            this.$router.push(`/home_professional/${data.id}`);
          } else if (data.role === 'customer') {
            this.$router.push(`/home_customer/${data.id}`);
          }
        } else {
          this.errorMessage = data.message || 'Unknown error occurred';
        }
      } catch (error) {
        console.error(error);
        this.errorMessage = 'An error occurred. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  },
  template: `
  <div class="login-container" id="app">
  <h3>Login</h3>

  <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

  <div class="form-group">
    <label for="username">Username</label>
    <input v-model="username" type="text" id="username" class="form-control" required />
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input v-model="password" type="password" id="password" class="form-control" required />
  </div>

  <button @click="login" class="btn btn-dark" :disabled="loading">
    {{ loading ? 'Loading...' : 'Login' }}
  </button>

  <p>Don't have an account? <router-link to="/register">Register</router-link></p>
</div>
`,
};
