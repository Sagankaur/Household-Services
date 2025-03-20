//if, wrong param prvided,still giving all the requests
import axios from 'axios';

export default {
    name: 'SearchProfessional',
    data() {
        return {
            showRequestModal: false,
            selectedRequest: {},
            selectedSearchType: '',
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
    created() {
        this.userId = this.$store.getters.userId;
        // console.log("userId from route:", this.$route.params.userId);
        console.log("userId from store:", this.$store.getters.userId);
        console.log("final userId:", this.userId);
        if (this.userId) {
            this.searchRequests();
        } else {
            console.error("No userId found in route params or store");
            // Redirect to login or handle this error case
        }
    },
    methods: {
        async searchRequests() {
            await this.fetchRequests(); //{"requests": [{},{}..]}
            this.serviceRequests = this.Requests;
        },
        async fetchRequests() {
            try {
                const token = this.$store.getters.authToken; // Use Vuex state
                let params = {};
                
                if (this.search.date) {
                    params.search_type = "date";
                    params.value = this.search.date; // Use day and year directly here
                } else if (this.search.address) {
                    params.search_type = "address";
                    params.value = this.search.address;
                } else if (this.search.pincode) {
                    params.search_type = "pincode";
                    params.value = this.search.pincode;
                } 

                const response = await axios.get(`http://localhost:5000/search_professional/${this.userId}`, {
                    params: params,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                this.Requests = response.data.requests || []; // like this[0:{},1:{}}]
                console.log("Requests recived from search_prof", this.Requests)
                console.log("params",params)
                if (this.Requests.length === 0) {
                    this.error = "No matching service requests found.";
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },    
        async viewRequest(id) {
            try {
                const response = await fetch(`/view_request/${id}`);
                if (!response.ok) throw new Error("Failed to fetch request details");
                const data = await response.json();
                this.selectedRequest = data;
                this.showRequestModal = true;
            } catch (error) {
                console.error("Error viewing request:", error);
            }
        },
        closeModal() {
            this.showRequestModal = false;
        }
        // async searchRequests() {  
        //     // Implement your search logic here
        //     this.serviceRequests = this.Requests;
        // }
    },
    template:
    `
    <div id="app" class="container mt-5">
        <h2>Search Service Requests</h2>
        <form @submit.prevent="searchRequests">
        <div class="row mb-3">
            <div class="col-md-4">
                <select v-model="selectedSearchType" class="form-select">
                    <option value="">Select Search Type</option>
                    <option value="date">Search by Date</option>
                    <option value="address">Search by Address</option>
                    <option value="pincode">Search by Pincode</option>
                </select>
            </div>
            <div class="col-md-8">
                <input v-if="selectedSearchType === 'date'" 
                       type="date" 
                       v-model="search.date" 
                       class="form-control" 
                       placeholder="Select Date">
                <input v-if="selectedSearchType === 'address'" 
                       type="text" 
                       v-model="search.address" 
                       class="form-control" 
                       placeholder="Enter Address">
                <input v-if="selectedSearchType === 'pincode'" 
                       type="text" 
                       v-model="search.pincode" 
                       class="form-control" 
                       placeholder="Enter Pincode">
            </div>
        </div>
        <button type="submit" class="btn btn-primary">Search</button>
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
            <table class="table table-striped">
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