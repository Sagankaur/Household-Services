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
                console.log("selectedDetailsProf",this.selectedDetails)
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
                console.log("selectedDetailsCust",this.selectedDetails)
                this.showFullDetails = false;
            } catch (error) {
                console.error('Error fetching customer details:', error);
            }
        },
        async viewServiceRequest(id) {
            try {
                const response = await axios.get(`/view_request/${id}`);
                this.selectedDetails = response.data;
                console.log("selectedDetailsReq",this.selectedDetails)
                this.showFullDetails = false;
            } catch (error) {
                console.error('Error fetching service details:', error);
            }
        },
        openEditModal(service) {
            this.selectedDetails = service;
            // Logic to open an edit modal goes here
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
    template: `
    <div id='app'>
        <input v-model="searchQuery" placeholder="Search..." />
        <select v-model="searchType">
            <option value="Professional">Professional</option>
            <option value="Customer">Customer</option>
            <option value="Service Request">Service Request</option>
        </select>
        <button @click="fetchData">Search</button>

        <div v-if="searchResults.length">
            <h3>Results for {{ searchType }}</h3>... <!-- Professional Table -->
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
            <table class="table">
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody v-if="searchType === 'Professional'">
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>{{ selectedDetails.professional?.name || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Username:</strong></td>
                        <td>{{ selectedDetails.professional?.username || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Email:</strong></td>
                        <td>{{ selectedDetails.professional?.email || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Address:</strong></td>
                        <td>{{ selectedDetails.professional?.address || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Service Name:</strong></td>
                        <td>{{ selectedDetails.professional?.service_name || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Experience:</strong></td>
                        <td>{{ selectedDetails.professional?.experience || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Status:</strong></td>
                        <td>{{ selectedDetails.professional?.status || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Reviews:</strong></td>
                        <td>{{ selectedDetails.professional?.total_reviews || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Ratings:</strong></td>
                        <td>{{ selectedDetails.professional?.ratings || 'N/A' }}</td>
                    </tr>
                </tbody>
            
                <tbody v-if="searchType === 'Customer'">
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>{{ selectedDetails.customer?.name || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Username:</strong></td>
                        <td>{{ selectedDetails.customer?.username || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Email:</strong></td>
                        <td>{{ selectedDetails.customer?.email || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Address:</strong></td>
                        <td>{{ selectedDetails.customer?.address || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Phone Number:</strong></td>
                        <td>{{ selectedDetails.customer?.phone_number || 'N/A' }}</td>
                    </tr>
                    <tr>
                        <td><strong>Pincode:</strong></td>
                        <td>{{ selectedDetails.customer?.pincode || 'N/A' }}</td>
                    </tr>
                </tbody>
        
                <tbody v-if="searchType === 'Service Request'">
                    <tr v-if="selectedDetails">
                        <td><strong>Service:</strong></td>
                        <td>{{ selectedDetails.service || 'N/A' }}</td>
                    </tr>
                    <tr v-if="selectedDetails">
                        <td><strong>Professional:</strong></td>
                        <td>{{ selectedDetails.professional_name }} ({{ selectedDetails.professional_username }})</td>
                    </tr>
                    <tr v-if="selectedDetails">
                        <td><strong>Date Requested:</strong></td>
                        <td>{{ selectedDetails.date_of_request || 'N/A' }}</td>
                    </tr>
                    <tr v-if="selectedDetails">
                        <td><strong>Date Completed:</strong></td>
                        <td>{{ selectedDetails.date_of_completion || 'Pending' }}</td>
                    </tr>
                    <tr v-if="selectedDetails">
                        <td><strong>Status:</strong></td>
                        <td>{{ selectedDetails.service_status || 'N/A' }}</td>
                    </tr>
                    <tr v-if="selectedDetails">
                        <td><strong>Rating:</strong></td>
                        <td>{{ selectedDetails.rating || 'N/A' }}</td>
                    </tr>
                    <tr v-if="selectedDetails">
                        <td><strong>Review:</strong></td>
                        <td>{{ selectedDetails.review || 'No review' }}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Service Request Table (for Professional) -->
                <div v-if="searchType === 'Professional' && selectedDetails.service_requests && selectedDetails.service_requests.length">
                    <h4>Service Requests:</h4>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer Name</th>
                                <th>Service</th>
                                <th>Status</th>
                                <th>Date of Request</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="request in selectedDetails.service_requests" :key="request.id">
                                <td>{{ request.id }}</td>
                                <td>{{ request.customer_name }}</td>
                                <td>{{ request.service }}</td>
                                <td>{{ request.service_status }}</td>
                                <td>{{ request.date_of_request }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <button @click="toggleFullDetails" class="btn btn-secondary">
                {{ showFullDetails ? 'Hide' : 'View' }} Full Details
            </button>

            <div v-if="showFullDetails">
                <h3>Full Details from Database</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Field</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(value, key) in selectedDetails" :key="key">
                            <tr v-if="typeof value !== 'object'">
                                <td><strong>{{ key }}</strong></td>
                                <td>{{ value }}</td>
                            </tr>
                            <tr v-else>
                                <td><strong>{{ key }}</strong></td>
                                <td>
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Field</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <template v-for="(subValue, subKey) in value" :key="subKey">
                                                <tr v-if="typeof subValue !== 'object'">
                                                    <td><strong>{{ subKey }}</strong></td>
                                                    <td>{{ subValue }}</td>
                                                </tr>
                                                <tr v-else>
                                                    <td><strong>{{ subKey }}</strong></td>
                                                    <td>
                                                        <table class="table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Field</th>
                                                                    <th>Value</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr v-for="(deepValue, deepKey) in subValue" :key="deepKey">
                                                                    <td><strong>{{ deepKey }}</strong></td>
                                                                    <td>{{ deepValue }}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
    
        <p v-if="message">{{ message }}</p>
    </div>
    `
}
