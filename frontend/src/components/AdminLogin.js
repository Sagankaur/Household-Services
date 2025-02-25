export default {
    name: 'AdminLogin',
    data() {
      return {
        username: "",
        password: "",
        errorMessage: "",
        loading: false,
      };
    },
    methods: {
      validateUsername(username) {
        const regex = /^[A-Za-z0-9]+_/;
        return regex.test(username);
      },
  
      async login() {
        if (!this.validateUsername(this.username)) {
          this.errorMessage = "Username can contain only letters and numbers and underscore";
          return;
        }
  
        this.loading = true;
        this.errorMessage = "";
  
        try {
          const response = await fetch('http://localhost:5000/adminlogin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: this.username.trim(), password: this.password }),
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            // console.log(username, password)
            this.errorMessage = data.response?.errors?.[0] || "Invalid credentials";
            return;
          }
  
          if (data.role !== 'admin') {
            this.errorMessage = "Access Denied. Only admins can log in.";
            return;
          }
  
          localStorage.setItem('auth-token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('id', data.id);
          localStorage.setItem('user', JSON.stringify(data));
          this.$store.commit('setUser', data);
  
          this.$router.push(`/home_admin/${data.id}`);
        } catch (error) {
          console.error("Login failed:", error);
          this.errorMessage = 'An error occurred. Please try again.';
        } finally {
          this.loading = false;
        }
      }
    },
    template: `
      <div class="login-container" id="app">
        <h3>Admin Login</h3>
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
      </div>
    `,
  };