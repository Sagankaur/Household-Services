import axios from 'axios';

export default {
    name: 'SearchProfessional',
    data() {
        return {
            showRequestModal: false,
            selectedRequest: {},
            Requests: [],
            userId: null,
            search: {
                date: '',
                address: '',
                pincode: ''
            },
            serviceRequests: []
        }
    },
    mounted() {
        this.userId = this.$route.params.userId;
        this.fetchData();
    },
    methods: {
        async fetchData() {
            await this.fetchRequests(this.userId);
        },
        async fetchRequests(userId) {
            try {
                const token = this.$store.getters.authToken; // Use Vuex state
                const response = await axios.get(`http://localhost:5000/search_professional/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.Requests = response.data.requests;
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },    
        async viewRequest(id) {
            const response = await fetch(`/view_request/${id}`);
            const data = await response.json();
            this.selectedRequest = data;
            this.showRequestModal = true;
        },
        closeModal() {
            this.showRequestModal = false;
        },
        async searchRequests() {  
            // Implement your search logic here
            this.serviceRequests = this.Requests;
        }
    },
    template:
    `
        <div id="app" class="container mt-5">
        <h2>Search Service Requests</h2>
        <form @submit.prevent="searchRequests">
            <div class="row">
                <div class="col-md-4">
                    <input type="date" v-model="search.date" class="form-control" placeholder="Search by Date">
                </div>
                <div class="col-md-4">
                    <input type="text" v-model="search.address" class="form-control" placeholder="Search by Address">
                </div>
                <div class="col-md-4">
                    <input type="text" v-model="search.pincode" class="form-control" placeholder="Search by Pincode">
                </div>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Search</button>
        </form>
        
        <!-- Modal for Viewing Service Request Details --> 
        <div v-if="showRequestModal" class="modal"> 
            <div class="modal-content"> 
                <span class="close" @click="closeModal">&times;</span> 
                <h4>Service Request Details</h4> 
                <p><strong>Customer Username:</strong> {{ selectedRequest.customer_username }}</p>
                <p><strong>Customer Name:</strong> {{ selectedRequest.customer_name }}</p> 
                <p><strong>Address:</strong> {{ selectedRequest.c_address }}</p> 
                <p><strong>Pincode:</strong> {{ selectedRequest.c_pincode }}</p> 
                <p><strong>Phone:</strong> {{ selectedRequest.c_phone }}</p> 
                <p><strong>Service:</strong> {{ selectedRequest.service }}</p> 
                <p><strong>Date of Request:</strong> {{ selectedRequest.date_of_request }}</p> 
                <p><strong>Remarks:</strong> {{ selectedRequest.remarks }}</p> 
            </div> 
        </div>

        <!-- Display search results -->
        <div v-if="serviceRequests.length > 0" class="mt-5">
            <h3>Search Results</h3>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer Name</th>
                        <th>Date</th>
                        <th>Address</th>
                        <th>Status</th>
                        <th>View</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in serviceRequests" :key="request.id">
                        <td>{{ request.id }}</td>
                        <td>{{ request.customer_name }}</td>
                        <td>{{ request.date_of_request }}</td>
                        <td>{{ request.c_address }}</td>
                        <td>{{ request.service_status }}</td>
                        <td>
                            <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else class="mt-4">No results found</div>
    </div>
`
    
}