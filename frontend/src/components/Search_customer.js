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
        userId: null,
        services: [],
        role: null,
        loading: false,
        error: null,
        bookingRemarks: ''
      };
    },
    
    created() {
        this.userId = this.$store.getters.userId;
        this.role = this.$store.getters.userRole; 

        console.log("User ID:", this.userId);
        console.log("Role:", this.role);

        if (this.userId) {
            this.fetchServices();
            this.searchServices(); 
        } else {
            console.error("No userId found. Redirecting to login...");
            this.$router.push('/login'); // Assuming you're using vue-router
        }
    },

    methods: {
        async searchServices() {
            this.loading = true;
            this.error = null;
            try {
                const token = this.$store.getters.authToken;
                if (!token) throw new Error("Auth token missing!");

                const response = await this.apiPost(
                    `http://localhost:5000/search_customer/${this.userId}`, 
                    this.searchCriteria
                );

                this.results = response.data.professionals;
            } catch (error) {
                console.error("Error searching services:", error);
                this.error = "Failed to search services. Please try again.";
            } finally {
                this.loading = false;
            }
        },

        async bookService(professional) {
            this.isBooking = true;
            this.selectedProfessional = professional;
        },

        async confirmBooking() {
            this.loading = true;
            this.error = null;
            try {
                const response = await this.apiPost(
                    `http://localhost:5000/book_service/${this.userId}/${this.selectedProfessional.professional.service_id}`, 
                    { 
                        professional_id: this.selectedProfessional.professional.id, 
                        service_id: this.selectedProfessional.professional.service_id,
                        remarks: this.bookingRemarks
                    }
                );
                
                alert(response.data.message);
                this.closeBooking();
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    this.error = "Only customers can book services.";
                } else {
                    console.error("Error booking service:", error);
                    this.error = "Failed to book service. Please try again.";
                }
            } finally {
                this.loading = false;
                this.isBooking = false;
            }
        },

        closeBooking() {
            this.isBooking = false;
            this.selectedProfessional = null;
            this.bookingRemarks = '';
        },

        async fetchServices() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get('http://localhost:5000/get_services');
                this.services = response.data;
            } catch (error) {
                console.error("Error fetching services:", error);
                this.error = "Failed to fetch services. Please refresh the page.";
            } finally {
                this.loading = false;
            }
        },

        async apiPost(url, data) {
            const token = this.$store.getters.authToken;
            if (!token) throw new Error("Auth token missing!");

            return axios.post(url, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },

        validateForm() {
            if (!this.searchCriteria.service_name) {
                this.error = "Please select a service.";
                return false;
            }
            return true;
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

        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

        <!-- Display Search Results -->
        <div v-if="results && results.length" class="mt-4">
            <h3>Available Professionals</h3>
            <table class="table table-striped">
                <!-- ... (your existing table structure) ... -->
                <tbody>
                    <tr v-for="professional in results" :key="professional.id">
                        <td>{{ professional.user.name }}</td>
                        <td>{{ professional.user.address }}</td>
                        <td>{{ professional.user.pincode }}</td>
                        <td>{{ professional.professional.ratings }}</td>
                        <td>
                            <button class="btn btn-success" @click="bookService(professional)">Book</button>
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
                    <p>Booking {{ selectedProfessional.user.name }} for {{ selectedProfessional.professional.service_name }}</p>
                    <p>
                        <label for="remarks">Remarks:</label>
                        <input id="remarks" type="text" v-model="bookingRemarks" placeholder="Enter remarks (optional)" class="form-control">
                    </p>
                    <button @click="confirmBooking" class="btn btn-primary" :disabled="loading">
                        {{ loading ? 'Booking...' : 'Confirm' }}
                    </button>
                    <button @click="closeBooking" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        </div>
    </div>    
    `
}
