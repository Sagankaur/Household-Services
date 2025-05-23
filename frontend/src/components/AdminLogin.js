export default {
  name: 'Login',
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
      loading: false,
    };
  },
  // created() {
  //   // Check if user is already logged in
  //   const userId = localStorage.getItem('userId');
  //   const role = localStorage.getItem('role');
  //   const token = localStorage.getItem('authToken');

  //   if (userId && role && token) {
  //     this.$store.dispatch('login', { userId, role, authToken: token });
  //     if (role.toLowerCase() === "admin") {
  //       this.$router.push(`/home_admin/${userId}`);
  //     }
  //   }
  // },
  methods: {
    validateInput() {
      if (!this.username.trim() || !this.password.trim()) {
        this.errorMessage = "Username and password cannot be empty.";
        return false;
      }
      if (this.username.length < 3) {
        this.errorMessage = "Username must be at least 3 characters long.";
        return false;
      }
      if (/\s/.test(this.username)) {
        this.errorMessage = "Username cannot contain spaces.";
        return false;
      }
      if (this.password.length < 6) {
        this.errorMessage = "Password must be at least 6 characters long.";
        return false;
      }
      if (!/[A-Z]/.test(this.password) || !/[0-9]/.test(this.password) || !/[\W_]/.test(this.password)) {
        this.errorMessage = "Password must contain at least one uppercase letter, one number, and one special character.";
        return false;
      }
      this.errorMessage = "";
      return true;
    },
    async login() {
      // if (!this.validateInput()) return;

      this.loading = true;
      this.errorMessage = "";
  
      try {
        const response = await fetch('http://localhost:5000/adminlogin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: this.username, password: this.password }),
        });
  
        const data = await response.json(); //'token': token, 'userId': user.id, 'role': role
        console.log('Full response data:', data);
        const { userId, role, token } = data;
        this.$store.dispatch('login', { userId, role, authToken: token }) 
  
        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }
  
        if (response.ok && data.token) {
          // Redirect based on role (case-insensitive check)
            this.$router.push(`/home_admin/${userId}`);
        } else {
          this.errorMessage = 'Login failed: No token received';
        }
      } catch (error) {
        console.error("Login error:", error);
        this.errorMessage = error.message || 'An error occurred. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  },
  template: `
  <div class="login-container" id="app">
    <h3>Login for Admin</h3>

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
