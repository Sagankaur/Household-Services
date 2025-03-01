import axios from 'axios';
export default {
    name: 'SearchCustomer',
    data() {
      return {
        searchCriteria: {
            service_name: '',
            pincode: '',
            rating: '',
            address: '',
            remarks: '',
        },
        results: [],
        isBooking: false,
        selectedProfessional: null,
        userId: this.$route.params.userId || null,
        services: []
      }
    },

    mounted() {
        // const userId = this.$route.params.userId;
        // const role = this.$route.params.role;
        this.fetchServices();
        this.searchServices();  
    },

    methods:{
        async searchServices() {
            try {
                const token = this.$store.getters.authToken; // Use Vuex state
                const response = await axios.post(`/search_customer`, this.searchCriteria, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.results = response.data.professionals;
            } catch (error) {
                console.error("Error searching services:", error);
            }
        },
        async bookService(professional) {
            try {
            const response = await axios.post(
                '/book_service', 
                { professional_id: professional.id, service_id: professional.service_id },
                { headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` } }
            );
            alert(response.data.message);
            } catch (error) {
            if (error.response && error.response.status === 403) {
                alert("Only customers can book services.");
            } else {
                console.error("Error booking service:", error);
            }
        }},
        confirmBooking() {
            alert(`Successfully booked ${this.selectedProfessional.name} for ${this.selectedProfessional.service_name}!`);
            this.closeBooking();
        },
        closeBooking() {
            this.isBooking = false;
            this.selectedProfessional = null;
        },
        async fetchServices() {
            try {
              const token = this.$store.getters.authToken;
              const response = await axios.get('/get_services', {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
              this.services = response.data.services;
            } catch (error) {
              console.error("Error fetching services:", error);
            }
        }
    },
    template: `
    <div id="app" class="container mt-5">
    <h2>Search for Services</h2>
    <form @submit.prevent="searchServices">
        <!-- Service Name Dropdown -->
        <label for="service_name">Service Name:</label>
        <select v-model="searchCriteria.service_name" name="service_name" required>
            <option value="">Select Service</option>
            <option v-for="service in services" :key="service.id" :value="service.name">
                {{ service.name }}
            </option>
        </select>
        <br><br>

        <!-- Optional Filters -->
        <label for="pincode">Pincode:</label>
        <input v-model="searchCriteria.pincode" type="text" name="pincode" placeholder="Enter Pincode"><br><br>

        <label for="rating">Minimum Rating:</label>
        <input v-model="searchCriteria.rating" type="number" name="rating" min="1" max="5" step="0.5" placeholder="e.g., 4.5"><br><br>

        <label for="address">Address:</label>
        <input v-model="searchCriteria.address" type="text" name="address" placeholder="Enter Address"><br><br>

        <button type="submit" class="btn btn-primary">Search</button>
    </form>

    <!-- Display Search Results -->
    <div v-if="results && results.length" class="mt-4">
        <h3>Available Professionals</h3>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Address</th>
                    <th>Pincode</th>
                    <th>Rating</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="professional in results" :key="professional.id">
                    <td>{{ professional.name }}</td>
                    <td>{{ professional.service_name }}</td>
                    <td>{{ professional.address }}</td>
                    <td>{{ professional.pincode }}</td>
                    <td>{{ professional.rating }}</td>
                    <td>
                        <button class="btn btn-success" v-if="role === 'Customer'"  @click="bookService(professional)">Book</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Booking Modal -->
    <div v-if="isBooking" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h4>Book Service</h4>
                <button @click="closeBooking" class="close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Booking {{ selectedProfessional.name }} for {{ selectedProfessional.service_name }}</p>
                <p>
                    <label for="remarks">Remarks:</label>
                    <input id="remarks" type="text" v-model="remarks" placeholder="Enter remarks (optional)" class="form-control">
                </p>
                <button @click="confirmBooking" class="btn btn-primary">Confirm</button>
                <button @click="closeBooking" class="btn btn-secondary">Cancel</button>
            </div>
        </div>
    </div>
</div>    
    `
  }
  