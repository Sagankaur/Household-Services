import axios from 'axios';

export default {
    name: 'SearchAdmin',
    data() {
      return {
        searchQuery: '',
        searchType: 'Professional',
        searchResults: [],
        selectedDetails: null,
        professionalId: null,
        message: '',
        userId: null,
        showFullDetails: false
      }
    },
    created() {
        this.userId = this.$store.getters.userId;
        console.log("Admin userId from store:", this.userId);
        if (this.userId) {
            this.fetchData();
        } else {
            console.error("No userId found in store");
            // Redirect to login or handle this error case
        }
    },
    methods: {
        async fetchData() {
            console.log(`Fetching data for admin with ID ${this.userId}`);
            const token = this.$store.getters.authToken;
            try {
                const response = await axios.get(`/search_admin/${this.userId}`, {
                    params: { search_type: this.searchType, query: this.searchQuery },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });
                console.log("data to be searched", response.data);
                this.searchResults = response.data;
            } catch (error) {
                console.error('Search error:', error);
            }
        },
        async viewProfessional(id) {
            try {
                const response = await axios.get(`/view_professional/${id}`);
                this.selectedDetails = response.data;
                this.showFullDetails = false;
            } catch (error) {
                console.error('Error fetching professional details:', error);
            }
        },
        async blockProfessional(id) {
            try {
                await axios.put(`/action_professional/${id}/block`);
                alert('Professional blocked successfully.');
                this.fetchData(); // Refresh the search results
            } catch (error) {
                console.error('Error blocking professional:', error);
            }
        },
        async viewCustomer(id) {
            try {
                const response = await axios.get(`/view_customer/${id}`);
                this.selectedDetails = response.data;
                this.showFullDetails = false;
            } catch (error) {
                console.error('Error fetching customer details:', error);
            }
        },
        async viewService(id) {
            try {
                const response = await axios.get(`/view_service/${id}`);
                this.selectedDetails = response.data;
                this.showFullDetails = false;
            } catch (error) {
                console.error('Error fetching service details:', error);
            }
        },
        openEditModal(service) {
            this.selectedDetails = service;
            // Logic to open an edit modal goes here
        },
        async viewServiceRequest(id) {
            try {
                const response = await axios.get(`/view_service_request/${id}`);
                this.selectedDetails = response.data;
                this.showFullDetails = false;
            } catch (error) {
                console.error('Error fetching service request details:', error);
            }
        },
        async deleteServiceRequest(id) {
            try {
                await axios.delete(`/delete_request/${id}`);
                alert('Service request deleted successfully.');
                this.fetchData(); // Refresh the search results
            } catch (error) {
                console.error('Error deleting service request:', error);
            }
        },
        async exportCSV(id) {
            try {
                const response = await axios.get(`/export_csv/${id}`);
                if (response.data.success) {
                    this.message = 'CSV export initiated. Check your email shortly.';
                } else {
                    this.message = 'CSV export failed.';
                }
            } catch (error) {
                console.error('Error exporting CSV:', error);
                this.message = 'Error exporting CSV. Please try again later.';
            }
        },
        toggleFullDetails() {
            this.showFullDetails = !this.showFullDetails;
        }
    },
    template:`
    <div id='app'>
        <input v-model="searchQuery" placeholder="Search..." />
        <select v-model="searchType">
            <option value="Professional">Professional</option>
            <option value="Customer">Customer</option>
            <option value="Service">Service</option>
            <option value="Service Request">Service Request</option>
        </select>
        <button @click="fetchData">Search</button>

        <div v-if="searchResults.length">
            <h3>Results for {{ searchType }}</h3>

            <!-- Professional Table -->
            <table v-if="searchType === 'Professional'" class="table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Ratings</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="prof in searchResults" :key="prof.id">
                        <td>{{ prof.username }}</td>
                        <td>{{ prof.ratings }}</td>
                        <td>{{ prof.status }}</td>
                        <td>
                            <button class="btn btn-info btn-sm" @click="viewProfessional(prof.id)">View</button>
                            <button class="btn btn-warning btn-sm" @click="blockProfessional(prof.id)">Block</button>        
                            <button @click="exportCSV(prof.id)" class="btn btn-primary">Export CSV</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Customer Table -->
            <table v-else-if="searchType === 'Customer'" class="table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="cust in searchResults" :key="cust.id">
                        <td>{{ cust.username }}</td>
                        <td>{{ cust.email }}</td>
                        <td>
                            <button class="btn btn-info btn-sm" @click="viewCustomer(cust.id)">View</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Service Table -->
            <table v-else-if="searchType === 'Service'" class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="service in searchResults" :key="service.id">
                        <td>{{ service.name }}</td>
                        <td>
                            <button class="btn btn-info btn-sm" @click="viewService(service.id)">View</button>
                            <button class="btn btn-warning btn-sm" @click="openEditModal(service)">Edit</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Service Request Table -->
            <table v-else-if="searchType === 'Service Request'" class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="req in searchResults" :key="req.id">
                        <td>{{ req.id }}</td>
                        <td>{{ req.service_status }}</td>
                        <td>
                            <button class="btn btn-info btn-sm" @click="viewServiceRequest(req.id)">View</button>
                            <button class="btn btn-danger btn-sm" @click="deleteServiceRequest(req.id)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Details Panel -->
        <div v-if="selectedDetails" class="mt-4">
            <h3>Details:</h3>
            <table class="table" v-if="!showFullDetails">
                <tbody>
                    <tr v-if="searchType === 'Professional' || searchType === 'Customer'">
                        <td><strong>Username:</strong></td>
                        <td>{{ selectedDetails.username }}</td>
                    </tr>
                    <tr v-if="searchType === 'Professional' || searchType === 'Customer'">
                        <td><strong>Name:</strong></td>
                        <td>{{ selectedDetails.name }}</td>
                    </tr>
                    <tr v-if="searchType === 'Professional' || searchType === 'Customer'">
                        <td><strong>Phone:</strong></td>
                        <td>{{ selectedDetails.phone_number }}</td>
                    </tr>
                    <tr v-if="searchType === 'Professional' || searchType === 'Customer'">
                        <td><strong>Pincode:</strong></td>
                        <td>{{ selectedDetails.pincode }}</td>
                    </tr>
                    <tr v-if="searchType === 'Service'">
                        <td><strong>Name:</strong></td>
                        <td>{{ selectedDetails.name }}</td>
                    </tr>
                    <tr v-if="searchType === 'Service'">
                        <td><strong>Time:</strong></td>
                        <td>{{ selectedDetails.time_required }}</td>
                    </tr>
                    <tr v-if="searchType === 'Service'">
                        <td><strong>Price:</strong></td>
                        <td>{{ selectedDetails.price }}</td>
                    </tr>
                    <tr v-if="searchType === 'Service'">
                        <td><strong>Description:</strong></td>
                        <td>{{ selectedDetails.description }}</td>
                    </tr>
                    <tr v-if="searchType === 'Service Request'">
                        <td><strong>ID:</strong></td>
                        <td>{{ selectedDetails.id }}</td>
                    </tr>
                    <tr v-if="searchType === 'Service Request'">
                        <td><strong>Customer Username:</strong></td>
                        <td>{{ selectedDetails.customer_username }}</td>
                    </tr>
                    <tr v-if="searchType === 'Service Request'">
                        <td><strong>Professional Username:</strong></td>
                        <td>{{ selectedDetails.professional_username }}</td>
                    </tr>
                </tbody>
            </table>
            <button @click="toggleFullDetails" class="btn btn-secondary">
                {{ showFullDetails ? 'Hide' : 'View' }} Full Details
            </button>
            <pre v-if="showFullDetails">{{ JSON.stringify(selectedDetails, null, 2) }}</pre>
        </div>

        <p v-if="message">{{ message }}</p>
    </div>
    `
}
