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
        userId: this.$route.params.userId
      }},
    mounted() {
        // const userId = this.$route.params.userId;
        // const role = this.$route.params.role;
        this.fetchData();
    },
    methods: {
        async fetchData() {
            console.log(`Fetching data for admin with ID ${this.userId}`);
            axios.get(`/search_admin/${this.userId}`, {
                params: { search_type: this.searchType, query: this.searchQuery }
            })
                .then(response => {
                this.searchResults = response.data;
                })
                .catch(error => {
                console.error('Search error:', error);
                });
        },
        viewProfessional(id) {
            axios.get(`/view_professional/${id}`)
                .then(response => {
                this.selectedDetails = response.data;
                })
                .catch(error => {
                console.error('Error fetching professional details:', error);
                });
        },
        blockProfessional(id) {
            axios.post(`/block_professional/${id}`)
                .then(() => {
                alert('Professional blocked successfully.');
                this.performSearch(); // Refresh the search results
                })
                .catch(error => {
                console.error('Error blocking professional:', error);
                });
        },
        viewCustomer(id) {
            axios.get(`/view_customer/${id}`)
                .then(response => {
                this.selectedDetails = response.data;
                })
                .catch(error => {
                console.error('Error fetching customer details:', error);
                });
        },
        viewService(id) {
            axios.get(`/view_service/${id}`)
                .then(response => {
                this.selectedDetails = response.data;
                })
                .catch(error => {
                console.error('Error fetching service details:', error);
                });
        },
        openEditModal(service) {
            this.selectedDetails = service;
            // Logic to open an edit modal goes here
        },
        viewServiceRequest(id) {
            axios.get(`/view_service_request/${id}`)
                .then(response => {
                this.selectedDetails = response.data;
                })
                .catch(error => {
                console.error('Error fetching service request details:', error);
                });
        },
        
        deleteServiceRequest(id) {
            axios.delete(`/delete_service_request/${id}`)
                .then(() => {
                alert('Service request deleted successfully.');
                this.performSearch(); // Refresh the search results
                })
                .catch(error => {
                console.error('Error deleting service request:', error);
                });
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
    <button @click="performSearch">Search</button>

    <div v-if="searchResults.length">
    <h3>Results for {{ searchType }}</h3>

    <!-- Professional Table -->
    <table v-if="searchType === 'Professional'">
        <tr>
            <th>Username</th>
            <th>Ratings</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
        <tr v-for="prof in searchResults" :key="prof.id">
        <td>{{ prof.username }}</td>
        <td>{{ prof.ratings }}</td>
        <td>{{ prof.status }}</td>
        <td>
            <button class="btn btn-info btn-sm" @click="viewProfessional(prof.id)">View</button>
            <button class="btn btn-warning btn-sm" @click="blockProfessional(prof.id)">Block</button>        
            <button @click="exportCSV(prof.id)" class="btn btn-primary">Export CSV</button>
            <p v-if="message">{{ message }}</p>
        </td>
        </tr>
    </table>

    <!-- Customer Table -->
    <table v-else-if="searchType === 'Customer'">
        <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Actions</th>
        </tr>
        <tr v-for="cust in searchResults" :key="cust.id">
            <td>{{ cust.username }}</td>
            <td>{{ cust.email }}</td>
            <td>
                <button @click="viewCustomer(cust.id)">View</button>
            </td>
        </tr>
    </table>

    <!-- Service Table -->
    <table v-else-if="searchType === 'Service'">
        <tr><th>Name</th><th>Actions</th></tr>
        <tr v-for="service in searchResults" :key="service.id">
        <td>{{ service.name }}</td>
        <td>
            <button class="btn btn-info btn-sm" @click="viewService(service.id)">View</button>
            <button class="btn btn-warning btn-sm" @click="openEditModal(service)">Edit</button>
        </td>
        </tr>
    </table>

    <!-- Service Request Table -->
    <table v-else-if="searchType === 'Service Request'">
        <tr><th>ID</th><th>Status</th><th>Actions</th></tr>
        <tr v-for="req in searchResults" :key="req.id">
        <td>{{ req.id }}</td>
        <td>{{ req.service_status }}</td>
        <td>
            <button @click="viewServiceRequest(req.id)">View</button>
            <button @click="deleteServiceRequest(req.id)">Delete</button>
        </td>
        </tr>
    </table>
    </div>

    <!-- Details Panel -->
    <div v-if="selectedDetails">
    <h3>Details:</h3>
    <pre>{{ selectedDetails }}</pre>
    </div>
</div>

	`
}