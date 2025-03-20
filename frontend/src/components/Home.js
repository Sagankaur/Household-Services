import axios from 'axios';
export default {
  name: 'Home',
  data() {
    return {
      services: [],  // Initialize an empty array to store the services
      isLoading: true,  // Flag to track the loading state
      error: null  // Variable to store any error messages
    }
  },
  
mounted() {
  // Fetch the services from the Flask API when the component is mounted
  axios.get('http://localhost:5000/get_services')
    .then(response => {
      this.services = response.data; // Assign the fetched data to the services array
      this.isLoading = false; // Set the loading state to false
    })
    .catch(error => {
      this.error = error.message; // Store the error message
      this.isLoading = false; // Set the loading state to false
      console.error("There was an error fetching the services:", error);
    });
  },
  template: `
  <div>
    <h1 class="text-center my-4">Our Services</h1>

    <!-- Display a loading message while the data is being fetched -->
    <div v-if="isLoading" class="text-center">
      <p>Loading services...</p>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Display an error message if there's an error -->
    <div v-else-if="error" class="alert alert-danger text-center">
      <p>Error: {{ error }}</p>
    </div>

    <!-- Display a grid of services -->
    <div v-else-if="services && services.length > 0" class="container">
      <div class="row">
        <!-- Loop through each service and display it in a card -->
        <div
          v-for="service in services"
          :key="service.id"
          class="col-md-4 col-sm-6 mb-4"
        >
          <div class="card h-100">
            <div class="card-body">
              <!-- Service Name -->
              <h5 class="card-title text-center">{{ service.name }}</h5>
              <!-- Service Price -->
              <p><strong>Price:</strong> {{ service.price || 'N/A' }}</p>
              <!-- Service Time -->
              <p><strong>Time:</strong> {{ service.time || 'N/A' }}</p>
              <!-- Service Description -->
              <p><strong>Description:</strong></p>
              <p>{{ service.description || 'No description available.' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Display a message if there are no services -->
    <div v-else class="text-center">
      <p>No services available at the moment.</p>
    </div>
  </div>
  `
}
