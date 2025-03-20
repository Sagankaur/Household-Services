//experience data not showing
import axios from 'axios';

export default {
    name: 'HomeProfessional',
    data() {
        return {
            userId: null,
            showRequestModal: false,
            selectedRequest: {},
            PendingRequests: [],
            AcceptedRequests: [],
            CompletedRequests: [],
            user: {
                username: '',
                email: '',
                phone_number: '',
                address: '',
                pincode: ''
            },
            professional: {
                name: '',
                address: '',
                experience: '',
                status: '',
                ratings: '',
                review: ''
            },
            isEditing: false
        };
    },
    created() {
        this.userId = this.$store.getters.userId;

        // console.log("userId from route:", this.$route.params.userId);
        console.log("userId from store:", this.$store.getters.userId);
        console.log("final userId:", this.userId);
        if (this.userId) {
            this.fetchData();
        } else {
            console.error("No userId found in route params or store");
            // Redirect to login or handle this error case
        }
    },
    methods: {
        async fetchData() {
            try {
                const token = this.$store.getters.authToken;
                console.log("token: ", token);
                console.log("Sending Headers:", {
                    Authorization: `Bearer ${token}`
                });
                const response = await axios.get(`http://localhost:5000/home_professional/${this.userId}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                    
                });
                const data = response.data;
                this.PendingRequests = data.pending_requests;
                this.AcceptedRequests = data.accepted_requests;
                this.CompletedRequests = data.completed_requests;
                this.user = data.user;
                this.professional = data.professional; 
                console.log(response.data)
                console.log("professional DATA fetched")
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        async updateProfile() {
            try {
                console.log("Updating profile for userId:", this.userId); //working Updating profile for userId: 2
                const response = await axios.put(`http://localhost:5000/home_professional/${this.userId}`, {
                    ...this.user,
                    ...this.professional,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.$store.getters.authToken}`
                    }
                });
                console.log("Update response:", response.data);
                alert(response.data.message);
                this.isEditing = false;
                this.fetchData(); // Refresh data after update
            } catch (error) {
                console.error("Error updating professional profile:", error);
            }
        },
        editProfile() {
            this.isEditing = true;
        },
        cancelEdit() {
            this.isEditing = false;
        },
        async viewRequest(id) {
            try {
                const response = await axios.get(`http://localhost:5000/view_request/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.$store.getters.authToken}`
                    }
                });
                console.log("View Request Response:", response.data);
                // this.showRequestModal= true;

                if (response.data && response.data.id === id) {
                    this.selectedRequest = response.data;
                    console.log("Modal Visibility Before:", this.showRequestModal);
                    this.showRequestModal = true;
                    console.log("Modal Visibility After:", this.showRequestModal);
                    console.log("Selected Request:", this.selectedRequest);
                } else {
                    console.error("Request not found");
                }
            } catch (error) {
                console.error("Error fetching request:", error);
            }
        },
        async approveRequest(id) {
            try {
                await axios.post(`http://localhost:5000/service_request_action/${this.userId}/${id}/accept`, {}, {
                    headers: {
                        Authorization: `Bearer ${this.$store.getters.authToken}`
                    }
                });
                alert('Request accepted successfully.');
                this.fetchData();
            } catch (error) {
                console.error('Error approving request:', error);
                alert('Failed to approve request.');
            }
        },
        async rejectRequest(id) {
            try {
                await axios.post(`http://localhost:5000/service_request_action/${this.userId}/${id}/reject`, {}, {
                    headers: {
                        Authorization: `Bearer ${this.$store.getters.authToken}`
                    }
                });
                alert('Request rejected successfully.');
                this.fetchData();
            } catch (error) {
                console.error('Error rejecting request:', error);
                alert('Failed to reject request.');
            }
        },
        closeModal() {
            this.showRequestModal = false; // Changed variable name
        }
    },

    template: `
    <div id="app" class="container mt-5">
        <h2>{{ user.name }} Dashboard</h2>

        <!-- Profile Update Form -->
        <div v-if="isEditing" class="card mb-4">
            <div class="card-body">
                <h4>Edit Profile</h4>
                <form @submit.prevent="updateProfile">
                    <!-- User Fields -->
                    <div class="mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input
                            type="text"
                            class="form-control"
                            id="username"
                            v-model="user.username"
                        />
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input
                            type="email"
                            class="form-control"
                            id="email"
                            v-model="user.email"
                        />
                    </div>
                    <div class="mb-3">
                        <label for="phone_number" class="form-label">Phone Number</label>
                        <input
                            type="text"
                            class="form-control"
                            id="phone_number"
                            v-model="user.phone_number"
                        />
                    </div>
                    <div class="mb-3">
                        <label for="address" class="form-label">Address</label>
                        <textarea
                            class="form-control"
                            id="address"
                            v-model="user.address"
                        ></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="pincode" class="form-label">Pincode</label>
                        <input
                            type="text"
                            class="form-control"
                            id="pincode"
                            v-model="user.pincode"
                        />
                    </div>

                    <!-- Professional-Specific Fields -->
                    <div class="mb-3">
                        <label for="name" class="form-label">Name</label>
                        <input
                            type="text"
                            class="form-control"
                            id="name"
                            v-model="user.name"
                        />
                    </div>
                    <div class="mb-3">
                        <label for="address" class="form-label">Address</label>
                        <textarea
                            class="form-control"
                            id="address"
                            v-model="user.address"
                        />
                    </div>
                    <div class="mb-3">
                        <label for="experience" class="form-label">Experience (years)</label>
                        <input
                            type="number"
                            class="form-control"
                            id="experience"
                            v-model="professional.experience"
                        />
                    </div>
                    <button type="submit" class="btn btn-outline-primary">Save Changes</button>
                </form>
                <button @click="cancelEdit" class="btn btn-outline-secondary">Cancel</button>
            </div>
        </div>

        <div v-if="!isEditing" class="profile-overview">
            <ul>
                <li><strong>Username:</strong> {{ user.username }}</li>
                <li><strong>Email:</strong> {{ user.email }}</li>
                <li><strong>Phone:</strong> {{ user.phone_number }}</li>
                <li><strong>Address:</strong> {{ user.address }}</li>
                <li><strong>Pincode:</strong> {{ user.pincode }}</li>
                <li><strong>Experience:</strong> {{ professional.experience }}</li>
            </ul>
            <button btn btn-outline-primary @click="editProfile">Edit Profile</button>
        </div>

        <!-- Modal for Viewing Service Request Details -->
        <div v-if="showRequestModal" class="modal">
            <!-- SHOWN -->
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

        <!--approved Service Requests Table -->
        <div class="card mt-4">
            <div class="card-body">
                <h4>Approved Service Requests</h4>
                <table v-if="AcceptedRequests.length > 0" class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer Name</th>
                            <th>Date of Request</th>
                            <th>Phone</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="request in AcceptedRequests" :key="request.id">
                            <td>{{ request.id }}</td>
                            <td>{{ request.customer_name }}</td>
                            <td>{{ request.date_of_request }}</td>
                            <td>{{ request.c_phone }}</td>
                            <td>
                                <button class="btn btn-outline-primary" @click="viewRequest(request.id)">View</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p v-else>No accepted service requests.</p>
            </div>
        </div>

        <!-- Pending Service Requests Table -->
        <div class="card mt-4">
            <div class="card-body">
                <h4>Pending Service Requests</h4>
                <table v-if="PendingRequests.length > 0" class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer Name</th>
                            <th>Date of Request</th>
                            <th>Phone</th>
                            <th>Actions</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="request in PendingRequests" :key="request.id">
                            <td>{{ request.id }}</td>
                            <td>{{ request.customer_name }}</td>
                            <td>{{ request.date_of_request }}</td>
                            <td>{{ request.c_phone }}</td>
                            <td>
                                <button class="btn btn-outline-success" @click="approveRequest(request.id)">Approve</button>
                                <button class="btn btn-outline-danger" @click="rejectRequest(request.id)">Reject</button>
                            </td>
                            <td>
                                <button class="btn btn-outline-primary" @click="viewRequest(request.id)">View</button>
                            </td>

                        </tr>

                    </tbody>
                </table>
                <p v-else>No Pending service requests.</p>

            </div>
        </div>

        <!-- Closed Service Requests Table -->
        <div class="card mt-4">
            <div class="card-body">
                <h4>Completed Service Requests</h4>
                <table v-if="CompletedRequests.length > 0" class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer Name</th>
                            <th>Date of Request</th>
                            <th>Phone</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="request in CompletedRequests" :key="request.id">
                            <td>{{ request.id }}</td>
                            <td>{{ request.customer_name }}</td>
                            <td>{{ request.date_of_request }}</td>
                            <td>{{ request.c_phone }}</td>
                            <td>
                                <button class="btn btn-outline-primary" @click="viewRequest(request.id)">View</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p v-else>No completed service requests.</p>

            </div>
        </div>
    </div>
    `
};
