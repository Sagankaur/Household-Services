import axios from 'axios';
export default {
  name: 'Register',
  data() {
    return {
      formData: {
        name: '',
        username: '',
        email: '',
        password: '',
        phone_number: '',
        role: '',
        service_type: '',
        experience: '',
        address: '',
        pincode: ''
      },
      services: [], // Array to hold the available services,
      successMessage: '',
      errorMessage: '' ,
      loading: false, 
      errors: {},  
    };
  },
  methods: {
    validateInput() {
      this.errors = {}; // Reset errors
    
      // Username validation
      if (!this.formData.username.trim() || this.formData.username.length < 3) {
        this.errors.username = 'Username must be at least 3 characters.';
      }
      if (/\s/.test(this.formData.username)) {
        this.errors.username = 'Username cannot contain spaces.';
      }
    
      // Name validation
      if (!this.formData.name.trim() || this.formData.name.length < 3 || !/^[a-zA-Z ]+$/.test(this.formData.name)) {
        this.errors.name = 'Name must be at least 3 letters and contain only alphabets.';
      }
    
      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.formData.email)) {
        this.errors.email = 'Enter a valid email address.';
      }
    
      // Password validation
      const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
      if (!passwordPattern.test(this.formData.password)) {
        this.errors.password = 'Password must be at least 6 characters with 1 uppercase, 1 number, and 1 special character.';
      }
    
      // Phone Number validation
      if (!/^\d{10}$/.test(this.formData.phone_number)) {
        this.errors.phone_number = 'Phone number must be 10 digits.';
      }
    
      // Pincode validation
      if (!/^\d{6}$/.test(this.formData.pincode)) {
        this.errors.pincode = 'Pincode must be exactly 6 digits.';
      }
    
      // Service Type & Experience validation for Professionals
      if (this.formData.role === 'Professional') {
        if (!this.formData.service_type) {
          this.errors.service_type = 'Please select a service type.';
        }
        if (!this.formData.experience || this.formData.experience < 0) {
          this.errors.experience = 'Experience must be a positive number.';
        }
      }
    
      return Object.keys(this.errors).length === 0; // ✅ Return false if any errors exist
    },
    // Method to fetch services from backend
    fetchServices() {
      axios
        .get('http://localhost:5000/get_services') // Assuming this endpoint is available
        .then(response => {
          this.services = response.data;
        })
        .catch(error => {
          console.error('Error fetching services:', error);
        });
    },
    submitForm() {
      if (!this.validateInput()) {
        console.log("Validation failed:", this.errors);
        return; // ✅ Stop submission if validation fails
      }
      axios
        .post('http://localhost:5000/register', this.formData)
        .then(response => {
          console.log('Full response:', response);
          const data = response.data;
          
          if (data.success) {
            // Display success message
            this.successMessage = `Registration successful! You can now login as ${this.formData.username}.`;
            
            // Optionally, you can set a timeout to redirect to login page after showing the message
            setTimeout(() => {
              this.$router.push("/login");
            }, 5000); // Redirect after 15 seconds
          } else {
            console.error('Registration failed:', data.message);
            this.errorMessage = data.message || "Registration failed. Please try again.";
          }
        })
        .catch(error => {
          console.error('Error during registration', error);
          this.errorMessage = "An error occurred during registration. Please try again.";
        });
    },
    
    // Method to toggle the visibility of professional fields based on role selection
    toggleProfessionalFields() {
      if (this.formData.role !== 'professional') {
        this.formData.service_type = '';
        this.formData.experience = '';
      }
    },
  },
  mounted() {
    this.fetchServices(); // Fetch available services when the component is mounted
  },
  template: `
    <div class="container mt-5">
      <h2 class="text-center">Register</h2>
        <!-- Success message -->
        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
      
        <!-- Username -->
        <div class="mb-3">
          <label for="username" class="form-label">Username</label>
          <input type="text" class="form-control" id="username" v-model="formData.username" required>
        </div>

        <!-- Name -->
        <div class="mb-3">
          <label for="name" class="form-label">Name</label>
          <input type="text" class="form-control" id="name" v-model="formData.name" required>
        </div>

        <!-- Email -->
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control" id="email" v-model="formData.email" required>
        </div>

        <!-- Password -->
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input type="password" class="form-control" id="password" v-model="formData.password" required>
        </div>

        <!-- Phone Number -->
        <div class="mb-3">
          <label for="phone_number" class="form-label">Phone Number</label>
          <input type="tel" class="form-control" id="phone_number" v-model="formData.phone_number" required>
        </div>

        <!-- Address -->
        <div class="mb-3">
          <label for="address" class="form-label">Address</label>
          <input type="text" class="form-control" id="address" v-model="formData.address" required>
        </div>

        <!-- Pincode -->
        <div class="mb-3">
          <label for="pincode" class="form-label">Pincode</label>
          <input type="text" class="form-control" id="pincode" v-model="formData.pincode" required>
        </div>

        <!-- Role Selection -->
        <div class="mb-3">
          <label for="role" class="form-label">Select Role</label>
          <select id="role" class="form-select" v-model="formData.role" @change="toggleProfessionalFields" required>
            <option value="">-- Select Role --</option>
            <option value="Customer">Customer</option>
            <option value="Professional">Service Professional</option>
          </select>
        </div>

        <!-- Service Professional Additional Fields -->
        <div v-if="formData.role === 'Professional'">
          <!-- Service Type Dropdown -->
          <div class="mb-3">
            <label for="service_type" class="form-label">Service Type</label>
            <select id="service_type" class="form-select" v-model="formData.service_type" required>
              <option value="">-- Select Service Type --</option>
              <option v-for="service in services" :key="service.id" :value="service.name">{{ service.name }}</option>
            </select>
          </div>

          <!-- Experience -->
          <div class="mb-3">
            <label for="experience" class="form-label">Experience (in years)</label>
            <input type="number" class="form-control" id="experience" v-model="formData.experience" min="0">
          </div>
        </div>
                  
        <button type="submit" @click="submitForm" class="btn btn-dark" :disabled="loading">
          {{ loading ? 'Loading...' : 'Register' }}
        </button>

        <!-- Success message -->
        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <!-- Error message -->
        <div v-if="Object.keys(errors).length > 0" class="alert alert-danger">
          <ul>
            <li v-for="(error, field) in errors" :key="field">{{ error }}</li>
          </ul>
        </div>

        <div v-if="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
      
      
    </div>
  `
};
