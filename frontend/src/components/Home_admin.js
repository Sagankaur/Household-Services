// //modals showin EDIT ,  View

import axios from 'axios';

export default {
    name: 'HomeAdmin',
    data() {
        return {
            services: [],
            newService: { name: '', price: '', time_required: '', description: '' },
            editService: {},
            pendingProfessionals: [],
            pendingRequests: [],
            lowRatedProfessionals: [],

            showModal: false,
            showEditModal: false,
            showProfessionalModal: false,
            selectedProfessional: {},
            selectedRequest: {},
            showRequestModal: false,
            showLoading: false,
            showAddServiceForm: false,
            adminData: null,
        };
    },
    created() {
        this.userId = this.$store.getters.userId;
        if (this.userId) {
            this.fetchData();
        } else {
            console.error("No userId found in store");
        }
    },
    methods: {
        async fetchData() {
            try {
                await Promise.all([
                    this.fetchAdminData(),
                    this.fetchServices()
                ]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },

        async fetchAdminData() {
            try {
                const token = this.$store.getters.authToken;
                const response = await axios.get(`/home_admin/${this.userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });
                this.adminData = response.data.admin;
                this.pendingProfessionals = response.data.pending_professionals;
                this.lowRatedProfessionals = response.data.low_rated_professionals;
                this.pendingRequests = response.data.pending_requests;
            } catch (error) {
                console.error("Error fetching Admin data:", error);
            }
        },

        async fetchServices() {
            try {
                const response = await axios.get('/get_services');
                this.services = response.data;
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        },

        async addService() {
            try {
                const response = await axios.post('/add_service', this.newService, {
                    'Authorization': `Bearer ${this.$store.getters.authToken}`
                });
                if (response.status === 200) {
                    alert('Service added successfully');
                    await this.fetchServices();
                    this.newService = { name: '', price: '', time_required: '', description: '' };
                }
            } catch (error) {
                console.error("Error adding service:", error);
            }
        },

        openEditModal(service) {
            this.showEditModal = true;
            this.editService = { ...service };
        },

        async updateService() {
            try {
                const response = await axios.put(`/update_service/${this.editService.id}`, this.editService, {
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.status === 200) {
                    alert('Service updated successfully');
                    await this.fetchServices();
                    this.showEditModal = false;
                }
            } catch (error) {
                console.error("Error updating service:", error);
            }
        },

        async approveProfessional(id) {
            try {
                const response = await axios.put(`/action_professional/${id}/approve`);
                if (response.status === 200) {
                    alert('Professional approved');
                    await this.fetchAdminData();
                }
            } catch (error) {
                console.error("Error approving professional:", error);
            }
        },

        async rejectProfessional(id) {
            try {
                const response = await axios.put(`/action_professional/${id}/reject`);
                if (response.status === 200) {
                    alert('Professional rejected');
                    await this.fetchAdminData();
                }
            } catch (error) {
                console.error("Error rejecting professional:", error);
            }
        },

        async blockProfessional(id) {
            try {
                const response = await axios.get(`/action_professional/${id}/block`);
                if (response.status === 200) {
                    alert('Professional blocked');
                    await this.fetchAdminData();
                }
            } catch (error) {
                console.error("Error blocking professional:", error);
            }
        },

        async deleteRequest(requestId) {
            try {
                const response = await axios.delete(`/delete_request/${requestId}`);
                if (response.status === 200) {
                    alert('Request deleted');
                    await this.fetchAdminData();
                }
            } catch (error) {
                console.error("Error deleting request:", error);
            }
        },

        async viewRequest(id) {
            try {
                const response = await axios.get(`/view_request/${id}`);
                this.selectedRequest = response.data;
                this.showRequestModal = true;
            } catch (error) {
                console.error("Error viewing request:", error);
            }
        },

        viewProfessional(professional) {
            this.selectedProfessional = professional;
            this.showProfessionalModal = true;
        },

        closeRequestModal() {
            this.showRequestModal = false;
        },
        closeEditModal() {
            this.showEditModal = false;
        },
        closeProfessionalModal() {
            this.showProfessionalModal = false;
        },
        toggleAddServiceForm() {
            this.showAddServiceForm = !this.showAddServiceForm;
        },
    },
    template: `
    <div id="app" class="container mt-5">
        <h2>{{ adminData ? adminData.name + " Dashboard" : "Loading Dashboard..." }}</h2>
        <!-- Admin Profile Overview -->

        <div v-if="adminData" class="profile-overview">
            <ul>
                <li><strong>Username:</strong> {{ adminData.username }}</li>
                <li><strong>Email:</strong> {{ adminData.email }}</li>
                <li><strong>Phone:</strong> {{ adminData.phone_number }}</li>
                <li><strong>Address:</strong> {{ adminData.address }}</li>
                <li><strong>Pincode:</strong> {{ adminData.pincode }}</li>
            </ul>
        </div>
        <div v-else>
          <p>Loading or no Admin Information</p>
        </div>

        <!-- Add New Service -->
        <button @click="toggleAddServiceForm" class="btn btn-primary mb-3">
            {{ showAddServiceForm ? 'Hide Add Service Form' : 'Add New Service' }}
        </button>

        <form v-if="showAddServiceForm" id="addServiceForm" @submit.prevent="addService" class="mb-5">
            <h3>Add New Service</h3>
            <input type="text" v-model="newService.name" placeholder="Service Name" required class="form-control mb-2">
            <input type="number" v-model="newService.price" placeholder="Price" required class="form-control mb-2">
            <input type="text" v-model="newService.time_required" placeholder="Time Required (mins)" required class="form-control mb-2">
            <textarea v-model="newService.description" placeholder="Description" class="form-control mb-2"></textarea>
            <button type="submit" class="btn btn-primary">Add Service</button>
        </form>

        <!-- Services List -->
        <h3>All Services</h3>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Time Required</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="service in services" :key="service.id">
                    <td>{{ service.name }}</td>
                    <td>{{ service.price }}</td>
                    <td>{{ service.time_required }} mins</td>
                    <td>
                        <button class="btn btn-info btn-sm" @click="openEditModal(service)">Edit</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Edit Service Modal -->
        <div v-if="showEditModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="closeEditModal">&times;</span>
                <h4>Edit Service</h4>
                <form @submit.prevent="updateService">
                    <div class="form-group">
                        <label for="editServiceName">Name:</label>
                        <input type="text" v-model="editService.name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="editServicePrice">Price:</label>
                        <input type="number" v-model="editService.price" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="editServiceTime">Time Required (mins):</label>
                        <input type="number" v-model="editService.time_required" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="editServiceDescription">Description:</label>
                        <textarea v-model="editService.description" class="form-control"></textarea>
                    </div>
                    <button type="submit" class="btn btn-success">Save Changes</button>
                </form>
            </div>
        </div>

        <!-- Professionals Pending Approval -->
        <h3>Pending Professionals</h3>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Service</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="professional in pendingProfessionals" :key="professional.id">
                    <td>{{ professional.username }}</td>
                    <td>{{ professional.service_name }}</td>
                    <td>
                        <button class="btn btn-info btn-sm" @click="viewProfessional(professional)">View</button>
                        <button class="btn btn-success btn-sm" @click="approveProfessional(professional.id)">Approve</button>
                        <button class="btn btn-danger btn-sm" @click="rejectProfessional(professional.id)">Reject</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Modal for Viewing Professional Details -->
        <div v-if="showProfessionalModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="closeProfessionalModal">&times;</span>
                <h4>Professional Details</h4>
                <p><strong>Name:</strong> {{ selectedProfessional.name }}</p>
                <p><strong>Username:</strong> {{ selectedProfessional.username }}</p>
                <p><strong>Email:</strong> {{ selectedProfessional.email }}</p>
                <p><strong>Service Type:</strong> {{ selectedProfessional.service_name }}</p>
                <p><strong>Experience:</strong> {{ selectedProfessional.experience }} years</p>
                <p><strong>Rating:</strong> {{ selectedProfessional.ratings }}/5</p>
            </div>
        </div>

        <!-- Service Requests -->
        <h3>Pending Service Requests</h3>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="request in pendingRequests" :key="request.id">
                    <td>{{ request.customer_username }}</td>
                    <td>{{ request.service }}</td>
                    <td>
                        <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
                        <button class="btn btn-danger btn-sm" @click="deleteRequest(request.id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Modal for Viewing Service Request Details -->
        <div v-if="showRequestModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="closeRequestModal">&times;</span>
                <h4>Service Request Details</h4>
                <p><strong>Customer Username:</strong> {{ selectedRequest.customer_username }}</p>
                <p><strong>Professional Username:</strong> {{ selectedRequest.professional_username }}</p>
                <p><strong>Customer Address:</strong> {{ selectedRequest.c_address }}</p>
                <p><strong>Service:</strong> {{ selectedRequest.service }}</p>
                <p><strong>Date of Request:</strong> {{ selectedRequest.date_of_request }}</p>
            </div>
        </div>

        <!-- Low Rated Professionals -->
        <h3>Low-Rated Professionals</h3>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Service</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="professional in lowRatedProfessionals" :key="professional.id">
                    <td>{{ professional.username }}</td>
                    <td>{{ professional.service_name }}</td>
                    <td>
                        <button class="btn btn-info btn-sm" @click="viewProfessional(professional)">View</button>
                        <button class="btn btn-warning btn-sm" @click="blockProfessional(professional.id)">Block</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `
};
