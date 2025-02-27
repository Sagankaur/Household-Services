// import axios from 'axios';
// export default{
//     name:'HomeProfessional',
//     props: ['userId'],
//     data:{
//         showModal: false,
//         selectedRequest: {}, // Holds the request details for modal
//         PendingRequests: [], // Array to hold pending requests
//         AcceptedRequests: [], // Array to hold accepted requests
//         CompletedRequests: [],
//         user :{},
//         professional:{},
//         isEditing: false
//     },
//     mounted(){
//         // const userId = this.$route.params.userId; // Vue Router automatically populates route params
//         this.fetchData();
//     },
//     methods:{
//         async fetchData() {
//             await Promise.all([
//                 this.fetchPendingRequests(this.userId),
//                 // this.fetchAcceptedRequests(userId),
//                 // this.fetchCompletedRequests(userId),
//                 this.fetchEdit(this.userId)
//             ]);
//         },
//         async fetchPendingRequests(userId) {
//             const response = await fetch(`/home_professional/${userId}`);
//             const data = await response.json();
//             this.PendingRequests = data.pending_requests;
//             this.AcceptedRequests = data.accepted_requests;
//             this.CompletedRequests = data.completed_requests;
//         },
//         // async fetchCompletedRequests() {
//         //     const response = await fetch(`/home_professsional/${userId}`);
//         //     const data = await response.json();
//         // },
//         async fetchEdit(userId) {
//             try {
//                 const response = await axios.get(`/home_professional/${userId}`);
//                 this.user = response.data.user;
//                 this.professional = response.data.professional;
//             } catch (error) {
//                 console.error("Error fetching professional data:", error);
//             }
//             },
//         async updateProfile() {
//             try {
//                 const response = await axios.post(`/home_professional/${this.userId}`, {
//                 ...this.user,
//                 ...this.professional,
//                 });
//                 alert(response.data.message);
//                 this.isEditing = false;
//             } catch (error) {
//                 console.error("Error updating professional profile:", error);
//             }
//             },
//         editProfile() {
//             this.isEditing = true; // Show the profile edit form
//         },
//         cancelEdit() {
//             this.isEditing = false; // Hide the edit form and keep the original data
//         },
//         async viewRequest(id) {
//             const response = await fetch(`/view_request/${id}`);
//             const data = await response.json();
//             this.selectedRequest = data;
//             this.showRequestModal = true;
//         },
//         async approveRequest(id) {
//         try {
//             await fetch(`/service_request_action/${id}/accept`, {
//                 method: 'POST',
//         });
//         alert('Request accepted successfully.');
//         // Optionally reload or update the table data here
//         } catch (error) {
//             console.error('Error approving request:', error);
//             alert('Failed to approve request.');
//             }
//         },
//         async rejectRequest(id) {
//             try {
//                 await fetch(`/service_request_action/${id}/reject`, {
//                     method: 'POST',
//                 });
//                 alert('Request rejected successfully.');
//                 // Optionally reload or update the table data here
//             } catch (error) {
//                 console.error('Error rejecting request:', error);
//                 alert('Failed to reject request.');
//             }
//         },

//         closeModal() {
//             this.showModal = false;
//         }
//     },
//     template:`
//     <div id ="app" class="container mt-5">
//         <h2>Professional Dashboard</h2>

//     <!-- Profile Update Form -->
//     <div v-if="isEditing" class="card mb-4">
//         <div class="card-body">
//           <h4>Edit Profile</h4>
//           <form @submit.prevent="updateProfile">
//             <!-- User Fields -->
//             <div class="mb-3">
//               <label for="username" class="form-label">Username</label>
//               <input
//                 type="text"
//                 class="form-control"
//                 id="username"
//                 v-model="user.username"
//               />
//             </div>
//             <div class="mb-3">
//               <label for="email" class="form-label">Email</label>
//               <input
//                 type="email"
//                 class="form-control"
//                 id="email"
//                 v-model="user.email"
//               />
//             </div>
//             <div class="mb-3">
//               <label for="phone_number" class="form-label">Phone Number</label>
//               <input
//                 type="text"
//                 class="form-control"
//                 id="phone_number"
//                 v-model="user.phone_number"
//               />
//             </div>
//             <div class="mb-3">
//               <label for="address" class="form-label">Address</label>
//               <textarea
//                 class="form-control"
//                 id="address"
//                 v-model="user.address"
//               ></textarea>
//             </div>
//             <div class="mb-3">
//               <label for="pincode" class="form-label">Pincode</label>
//               <input
//                 type="text"
//                 class="form-control"
//                 id="pincode"
//                 v-model="user.pincode"
//               />
//             </div>
  
//             <!-- Professional-Specific Fields -->
//             <div class="mb-3">
//               <label for="experience" class="form-label">Experience (years)</label>
//               <input
//                 type="number"
//                 class="form-control"
//                 id="experience"
//                 v-model="professional.experience"
//               />
//             </div>
  
//             <button type="submit" class="btn btn-primary">Save Changes</button>
//           </form>
//           <button @click="cancelEdit">Cancel</button>
//         </div>
//     </div>
//     <div v-if="!isEditing" class="profile-overview">
//         <h3>{{ professional.name }}</h3>
//         <p>{{ professional.email }}</p>
//         <p>{{ professional.phone }}</p>
//         <p>{{ professional.address }}</p>
//         <button @click="editProfile">Edit Profile</button>
//     </div>

//         <!-- Modal for Viewing Service Request Details --> 
//         <div v-if="showRequestModal" class="modal"> 
//             <div class="modal-content"> 
//                 <span class="close" @click="closeModal">&times;</span> 
//                 <h4>Service Request Details</h4> 
//                 <p><strong>Customer Username:</strong> {{ selectedRequest.customer_username }}</p>
//                 <p><strong>Customer Name:</strong> {{ selectedRequest.customer_name }}</p> 
//                 <p><strong>Address:</strong> {{ selectedRequest.address }}</p> 
//                 <p><strong>Pincode:</strong> {{ selectedRequest.pincode }}</p> 
//                 <p><strong>Phone:</strong> {{ selectedRequest.phone }}</p> 
//                 <p><strong>Email:</strong> {{ selectedRequest.email }}</p> 
//                 <p><strong>Service:</strong> {{ selectedRequest.service }}</p> 
//                 <p><strong>Date of Request:</strong> {{ selectedRequest.date_of_request }}</p> 
//                 <p><strong>Remarks:</strong> {{ selectedRequest.remarks }}</p> 
//             </div> 
//         </div>

//         <!--approved Service Requests Table -->
        
//         <div class="card mt-4">
//             <div class="card-body">
//                 <h4>Approved Service Requests</h4>
//                 <table class="table table-striped">
//                     <thead>
//                         <tr>
//                             <th>ID</th>
//                             <th>Customer Name</th>
//                             <th>Date of Request</th>
//                             <th>Phone</th>
//                             <th>View</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {% for request in AcceptedRequests %}
//                         <tr>
//                             <td>{{ request.id }}</td>
//                             <td>{{ request.customer.name }}</td>
//                             <td>{{ request.date_of_request.strftime('%Y-%m-%d') }}</td>
//                             <td>{{ request.customer.phone }}</td>
//                             <td>
//                                 <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
//                             </td>
//                         {% endfor %}
//                     </tbody>
//                 </table>
//             </div>

//     <!-- Pending Service Requests Table -->
//     <div class="card mt-4">
//         <div class="card-body">
//             <h4>Pending Service Requests</h4>
//             <table class="table table-striped">
//                 <thead>
//                     <tr>
//                         <th>ID</th>
//                         <th>Customer Name</th>
//                         <th>Date of Request</th>
//                         <th>Phone</th>
//                         <th>Actions</th>
//                         <th>View</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {% for request in PendingRequests %}
//                     <tr>
//                         <td>{{ request.id }}</td>
//                         <td>{{ request.customer.name }}</td>
//                         <td>{{ request.date_of_request.strftime('%Y-%m-%d') }}</td>
//                         <td>{{ request.customer.phone }}</td>
//                         <td>
//                             <button class="btn btn-info btn-sm" @click="approveRequest(request.id)">Approve</button>
//                             <button class="btn btn-info btn-sm" @click="rejectRequest(request.id)">Reject</button>
//                         </td>
//                         <td>
//                             <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
//                         </td>
                        
//                     </tr>
//                     {% endfor %}
//                 </tbody>
//             </table>
//         </div>
//     </div>

//     <!-- Closed Service Requests Table -->
//     <div class="card mt-4">
//         <div class="card-body">
//             <h4>Completed Service Requests</h4>
//             <table class="table table-striped">
//                 <thead>
//                     <tr>
//                         <th>ID</th>
//                         <th>Customer Name</th>
//                         <th>Date of Request</th>
//                         <th>Phone</th>
//                         <th>View</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {% for request in CompletedRequests %}
//                     <tr>
//                         <td>{{ request.id }}</td>
//                         <td>{{ request.customer.name }}</td>
//                         <td>{{ request.date_of_request.strftime('%Y-%m-%d') }}</td>
//                         <td>{{ request.customer.phone }}</td>
//                         <td>
//                             <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
//                         </td>
//                     {% endfor %}
//                 </tbody>
//             </table>
//         </div>
//     </div>
// </div>
//     `}

import axios from 'axios';
import { mapState } from 'vuex';

export default {
    name: 'HomeProfessional',
    computed: {
        ...mapState(['userId', 'token']),
    },
    data() {
        return {
            showModal: false,
            selectedRequest: {},
            PendingRequests: [],
            AcceptedRequests: [],
            CompletedRequests: [],
            user: {
                username: '',
                email: '',
                phone: '',
                address: '',
                pincode: ''
            },
            professional: {
                experience: '',
                status: '',
                ratings: '',
                review: ''
            },
            isEditing: false
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            try {
                const response = await axios.get(`/home_professional/${this.userId}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });
                const data = response.data;
                this.PendingRequests = data.pending_requests;
                this.AcceptedRequests = data.accepted_requests;
                this.CompletedRequests = data.completed_requests;
                this.user = data.user_prof.user;
                this.professional = data.user_prof.professional;
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        async updateProfile() {
            try {
                const response = await axios.post(`/home_professional/${this.userId}`, {
                    ...this.user,
                    ...this.professional,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.token}`
                    }
                });
                alert(response.data.message);
                this.isEditing = false;
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
                const response = await axios.get(`/view_request/${id}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`
                    }
                });
                this.selectedRequest = response.data;
                this.showModal = true;
            } catch (error) {
                console.error("Error fetching request:", error);
            }
        },
        async approveRequest(id) {
            try {
                await axios.post(`/service_request_action/${id}/accept`, {}, {
                    headers: {
                        Authorization: `Bearer ${this.token}`
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
                await axios.post(`/service_request_action/${id}/reject`, {}, {
                    headers: {
                        Authorization: `Bearer ${this.token}`
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
            this.showModal = false;
        }
    },
    // ... rest of the component (template) remains the same

template:`
<div id ="app" class="container mt-5">
    <h2>Professional Dashboard</h2>

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
          <label for="experience" class="form-label">Experience (years)</label>
          <input
            type="number"
            class="form-control"
            id="experience"
            v-model="professional.experience"
          />
        </div>

        <button type="submit" class="btn btn-primary">Save Changes</button>
      </form>
      <button @click="cancelEdit">Cancel</button>
    </div>
</div>
<div v-if="!isEditing" class="profile-overview">
    <h3>{{ professional.name }}</h3>
    <p>{{ professional.email }}</p>
    <p>{{ professional.phone }}</p>
    <p>{{ professional.address }}</p>
    <button @click="editProfile">Edit Profile</button>
</div>

    <!-- Modal for Viewing Service Request Details --> 
    <div v-if="showRequestModal" class="modal"> 
        <div class="modal-content"> 
            <span class="close" @click="closeModal">&times;</span> 
            <h4>Service Request Details</h4> 
            <p><strong>Customer Username:</strong> {{ selectedRequest.customer_username }}</p>
            <p><strong>Customer Name:</strong> {{ selectedRequest.customer_name }}</p> 
            <p><strong>Address:</strong> {{ selectedRequest.address }}</p> 
            <p><strong>Pincode:</strong> {{ selectedRequest.pincode }}</p> 
            <p><strong>Phone:</strong> {{ selectedRequest.phone }}</p> 
            <p><strong>Email:</strong> {{ selectedRequest.email }}</p> 
            <p><strong>Service:</strong> {{ selectedRequest.service }}</p> 
            <p><strong>Date of Request:</strong> {{ selectedRequest.date_of_request }}</p> 
            <p><strong>Remarks:</strong> {{ selectedRequest.remarks }}</p> 
        </div> 
    </div>

    <!--approved Service Requests Table -->
    
    <div class="card mt-4">
        <div class="card-body">
            <h4>Approved Service Requests</h4>
            <table class="table table-striped">
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
                    {% for request in AcceptedRequests %}
                    <tr>
                        <td>{{ request.id }}</td>
                        <td>{{ request.customer.name }}</td>
                        <td>{{ request.date_of_request.strftime('%Y-%m-%d') }}</td>
                        <td>{{ request.customer.phone }}</td>
                        <td>
                            <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
                        </td>
                    {% endfor %}
                </tbody>
            </table>
        </div>

<!-- Pending Service Requests Table -->
<div class="card mt-4">
    <div class="card-body">
        <h4>Pending Service Requests</h4>
        <table class="table table-striped">
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
                {% for request in PendingRequests %}
                <tr>
                    <td>{{ request.id }}</td>
                    <td>{{ request.customer.name }}</td>
                    <td>{{ request.date_of_request.strftime('%Y-%m-%d') }}</td>
                    <td>{{ request.customer.phone }}</td>
                    <td>
                        <button class="btn btn-info btn-sm" @click="approveRequest(request.id)">Approve</button>
                        <button class="btn btn-info btn-sm" @click="rejectRequest(request.id)">Reject</button>
                    </td>
                    <td>
                        <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
                    </td>
                    
                </tr>
                {% endfor %}
            </tbody>
        </table>
    </div>
</div>

<!-- Closed Service Requests Table -->
<div class="card mt-4">
    <div class="card-body">
        <h4>Completed Service Requests</h4>
        <table class="table table-striped">
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
                {% for request in CompletedRequests %}
                <tr>
                    <td>{{ request.id }}</td>
                    <td>{{ request.customer.name }}</td>
                    <td>{{ request.date_of_request.strftime('%Y-%m-%d') }}</td>
                    <td>{{ request.customer.phone }}</td>
                    <td>
                        <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
                    </td>
                {% endfor %}
            </tbody>
        </table>
    </div>
</div>
</div>
`

}