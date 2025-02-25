import axios from 'axios';
export default {
  name: 'Register',
  data() {
    return {
      formData: {
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
      services: [] // Array to hold the available services
    };
  },
  methods: {
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

    // Method to toggle the visibility of professional fields based on role selection
    toggleProfessionalFields() {
      if (this.formData.role !== 'professional') {
        this.formData.service_type = '';
        this.formData.experience = '';
      }
    },

    // Method to submit the form
    submitForm() {
      axios
        .post('/register', this.formData) // Send form data to Flask backend
        .then(response => {
          console.log('Registration successful', response);   
            window.location.href = `/login`; // Redirect to professional home after successful registration
          }
        )
        .catch(error => {
          console.error('Error during registration', error);
        });
    }
  },
  mounted() {
    this.fetchServices(); // Fetch available services when the component is mounted
  },
  template: `
    <div class="container mt-5">
      <h2 class="text-center">Register</h2>
      
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

        <button type="submit" class="btn btn-primary" @submit.prevent="submitForm">Register</button>
      
    </div>
  `
};
