// export default{
//     data:{
//         services: [],
//         newService: { name: '', price: '', time_required: '', description: '' },
//         editService: {},
//         pendingProfessionals: [],
//         pendingRequests: [],
//         lowRatedProfessionals: [],
//         showModal: false,
//         showEditModal: false,
//         showProfessionalModal: false,
//         selectedProfessional: {},
//         selectedRequest: {},
//         showRequestModal: false,
//         showLoading: false
//     },
//     name:'HomeAdmin',
//     mounted() {
//         // const userId = this.$route.params.userId;
//         this.fetchData();
//     },
//     methods: {
//         // Fetch all data when the page loads
//         async fetchData() {
//             await Promise.all([
//                 this.fetchServices(),
//                 this.fetchPendingProfessionals(),
//                 this.fetchPendingRequests(),
//                 this.fetchLowRatedProfessionals()
//             ]);
//         },

//         // Fetch all services
//         async fetchServices() {
//             const response = await fetch('/home_admin');
//             const data = await response.json();
//             this.services = data.services;
//         },

//         // Add a new service
//         async addService() {
//             const response = await fetch('/add_service', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(this.newService)
//             });
//             if (response.ok) {
//                 alert('Service added successfully');
//                 this.fetchServices();
//                 this.newService = { name: '', price: '', time_required: '', description: '' };
//             }
//         },

//         // Open Edit Modal
//         openEditModal(service) {
//             this.showEditModal = true;
//             this.editService = { ...service };
//         },

//         // Update service
//         async updateService() {
//             const response = await fetch(`/update_service/${this.editService.id}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(this.editService)
//             });
//             if (response.ok) {
//                 alert('Service updated successfully');
//                 this.fetchServices();
//                 this.showEditModal = false;
//             }
//         },

//         // Fetch pending professionals
//         async fetchPendingProfessionals() {
//             const response = await fetch('/home_admin');
//             const data = await response.json();
//             this.pendingProfessionals = data.pendingProfessionals;
//         },


//         // Approve professional
//         async approveProfessional(id) {
//             const response = await fetch(`/action_professional/${id}/approve`);
//             if (response.ok) {
//                 alert('Professional approved');
//                 this.fetchPendingProfessionals();
//             }
//         },

//         // Reject professional
//         async rejectProfessional(id) {
//             const response = await fetch(`/action_professional/${id}/reject`);
//             if (response.ok) {
//                 alert('Professional rejected');
//                 this.fetchPendingProfessionals();
//             }
//         },

//         // Block low-rated professional
//         async blockProfessional(id) {
//             const response = await fetch(`/action_professional/${id}/block`);
//             if (response.ok) {
//                 alert('Professional blocked');
//                 this.fetchLowRatedProfessionals();
//             }
//         },

//         // Fetch low-rated professionals
//         async fetchLowRatedProfessionals() {
//             const response = await fetch('/home_admin');
//             const data = await response.json();
//             this.lowRatedProfessionals = data.lowRatedProfessionals;
//         },

//         // Fetch pending service requests
//         async fetchPendingRequests() {
//             const response = await fetch('/home_admin');
//             const data = await response.json();
//             this.pendingRequests = data.pendingRequests;
//         },

//         // Delete a service request
//         async deleteRequest(requestId) {
//             const response = await fetch(`/delete_request/${requestId}`);
//             if (response.ok) {
//                 alert('Request deleted');
//                 this.fetchPendingRequests();
//             }
//         },

//         // View service request details
//         async viewRequest(id) {
//             const response = await fetch(`/view_request/${id}`);
//             const data = await response.json();
//             this.selectedRequest = data;
//             this.showRequestModal = true;
//         },

//         // View professional details
//         viewProfessional(professional) {
//             this.selectedProfessional = professional;
//             this.showProfessionalModal = true;
//         },

//         // Close modals
//         closeRequestModal() {
//             this.showRequestModal = false;
//         },
//         closeEditModal() {
//             this.showEditModal = false;
//         },
//         closeProfessionalModal() {
//             this.showProfessionalModal = false;
//         },
//     },
//     template:`
//     <div id="adminDashboard" class="container mt-5">
//         <h2>Admin Dashboard</h2>
    
//         <!-- Add New Service -->
//         <form id="addServiceForm" @submit.prevent="addService" class="mb-5">
//             <h3>Add New Service</h3>
//             <input type="text" v-model="newService.name" placeholder="Service Name" required class="form-control mb-2">
//             <input type="number" v-model="newService.price" placeholder="Price" required class="form-control mb-2">
//             <input type="text" v-model="newService.time_required" placeholder="Time Required (mins)" required class="form-control mb-2">
//             <textarea v-model="newService.description" placeholder="Description" class="form-control mb-2"></textarea>
//             <button type="submit" class="btn btn-primary">Add Service</button>
//         </form>
    
//         <!-- Services List -->
//         <h3>All Services</h3>
//         <table class="table table-striped">
//             <thead>
//                 <tr>
//                     <th>Name</th>
//                     <th>Price</th>
//                     <th>Time Required</th>
//                     <th>Actions</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 <tr v-for="service in services" :key="service.id">
//                     <td>{{ service.name }}</td>
//                     <td>{{ service.price }}</td>
//                     <td>{{ service.time_required }} mins</td>
//                     <td>
//                         <button class="btn btn-info btn-sm" @click="viewService(service)">View</button>
//                         <button class="btn btn-warning btn-sm" @click="openEditModal(service)">Edit</button>
//                     </td>
//                 </tr>
//             </tbody>
//         </table>
//      <!-- Edit Service Modal -->
//         <div v-if="showEditModal" class="modal">
//             <div class="modal-content">
//                 <span class="close" @click="closeEditModal">&times;</span>
//                 <h4>Edit Service</h4>
//                 <form @submit.prevent="updateService">
//                     <div class="form-group">
//                         <label for="editServiceName">Name:</label>
//                         <input type="text" v-model="editService.name" class="form-control" required>
//                     </div>
//                     <div class="form-group">
//                         <label for="editServicePrice">Price:</label>
//                         <input type="number" v-model="editService.price" class="form-control" required>
//                     </div>
//                     <div class="form-group">
//                         <label for="editServiceTime">Time Required (mins):</label>
//                         <input type="number" v-model="editService.time_required" class="form-control" required>
//                     </div>
//                     <div class="form-group">
//                         <label for="editServiceDescription">Description:</label>
//                         <textarea v-model="editService.description" class="form-control"></textarea>
//                     </div>
//                     <button type="submit" class="btn btn-success">Save Changes</button>
//                 </form>
//             </div>
//         </div>
    
//         <!-- Professionals Pending Approval -->
//         <h3>Pending Professionals</h3>
//         <table class="table table-striped">
//             <thead>
//                 <tr>
//                     <th>Username</th>
//                     <th>Service Type</th>
//                     <th>Actions</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 <tr v-for="professional in pendingProfessionals" :key="professional.id">
//                     <td>{{ professional.user.username }}</td>
//                     <td>{{ professional.service_type }}</td>
//                     <td>
//                         <button class="btn btn-info btn-sm" @click="viewProfessional(professional)">View</button>
//                         <button class="btn btn-success btn-sm" @click="approveProfessional(professional.id)">Approve</button>
//                         <button class="btn btn-danger btn-sm" @click="rejectProfessional(professional.id)">Reject</button>
//                     </td>
//                 </tr>
//             </tbody>
//         </table>
//         <!-- Modal for Viewing Professional Details -->
//         <div v-if="showProfessionalModal" class="modal">
//             <div class="modal-content">
//                 <span class="close" @click="closeModal">&times;</span>
//                 <h4>Professional Details</h4>
//                 <p><strong>Name:</strong> {{ selectedProfessional.user.name }}</p>
//                 <p><strong>Username:</strong> {{ selectedProfessional.user.username }}</p>
//                 <p><strong>Email:</strong> {{ selectedProfessional.user.email }}</p>
//                 <p><strong>Service Type:</strong> {{ selectedProfessional.service.name }}</p>
//                 <p><strong>Experience:</strong> {{ selectedProfessional.experience }} years</p>
//                 <p><strong>Rating:</strong> {{ selectedProfessional.ratings }}/5</p>
//             </div>
//         </div>
    
//         <!-- Service Requests -->
//         <h3>Pending Service Requests</h3>
//         <table class="table table-striped">
//             <thead>
//                 <tr>
//                     <th>Customer</th>
//                     <th>Service</th>
//                     <th>Actions</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 <tr v-for="request in pendingRequests" :key="request.id">
//                     <td>{{ request.customer.user.username }}</td>
//                     <td>{{ request.service.name }}</td>
//                     <td>
//                         <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
//                         <button class="btn btn-danger btn-sm" @click="deleteRequest(request.id)">Delete</button>
//                     </td>
//                 </tr>
//             </tbody>
//         </table>
//         <!-- Modal for Viewing Service Request Details --> 
//         <div v-if="showRequestModal" class="modal"> 
//             <div class="modal-content"> 
//                 <span class="close" @click="closeRequestModal">&times;</span> 
//                 <h4>Service Request Details</h4> 
//                 <p><strong>Customer Username:</strong> {{ selectedRequest.customer_username }}</p>
//                 <p><strong>Professional Username:</strong> {{ selectedRequest.professional_username }}</p>
//                 <p><strong>Customer Address:</strong> {{ selectedRequest.c_address }}</p> 
//                 <p><strong>Service:</strong> {{ selectedRequest.service }}</p> 
//                 <p><strong>Date of Request:</strong> {{ selectedRequest.date_of_request }}</p>
//             </div> 
//         </div>
//         <!-- Low Rated Professionals -->
//         <h3>Low-Rated Professionals</h3>
//         <table class="table table-striped">
//             <thead>
//                 <tr>
//                     <th>Username</th>
//                     <th>Actions</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 <tr v-for="professional in lowRatedProfessionals" :key="professional.id">
//                     <td>{{ professional.user.username }}</td>
//                     <td>
//                         <button class="btn btn-info btn-sm" @click="viewProfessional(professional)">View</button>
//                         <button class="btn btn-warning btn-sm" @click="blockProfessional(professional.id)">Block</button>
//                     </td>
//                 </tr>
//             </tbody>
//         </table>
//     </div>
//     `  
// };
export default {
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
        showLoading: false
      };
    },
    name: 'HomeAdmin',
    mounted() {
      this.fetchData();
    },
    methods: {
      // Fetch all data when the page loads
      async fetchData() {
        try {
          await Promise.all([
            this.fetchServices(),
            this.fetchPendingProfessionals(),
            this.fetchPendingRequests(),
            this.fetchLowRatedProfessionals()
          ]);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      },
  
      // Fetch all services
      async fetchServices() {
        try {
          const response = await fetch('/home_admin/services');
          const data = await response.json();
          this.services = data.services;
        } catch (error) {
          console.error("Error fetching services:", error);
        }
      },
  
      // Add a new service
      async addService() {
        try {
          const response = await fetch('/add_service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.newService)
          });
          if (response.ok) {
            alert('Service added successfully');
            await this.fetchServices();
            this.newService = { name: '', price: '', time_required: '', description: '' };
          }
        } catch (error) {
          console.error("Error adding service:", error);
        }
      },
  
      // Open Edit Modal
      openEditModal(service) {
        this.showEditModal = true;
        this.editService = { ...service };
      },
  
      // Update service
      async updateService() {
        try {
          const response = await fetch(`/update_service/${this.editService.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.editService)
          });
          if (response.ok) {
            alert('Service updated successfully');
            await this.fetchServices();
            this.showEditModal = false;
          }
        } catch (error) {
          console.error("Error updating service:", error);
        }
      },
  
      // Fetch pending professionals
      async fetchPendingProfessionals() {
        try {
          const response = await fetch('/home_admin/pending_professionals');
          const data = await response.json();
          this.pendingProfessionals = data.pendingProfessionals;
        } catch (error) {
          console.error("Error fetching pending professionals:", error);
        }
      },
  
      // Approve professional
      async approveProfessional(id) {
        try {
          const response = await fetch(`/action_professional/${id}/approve`);
          if (response.ok) {
            alert('Professional approved');
            await this.fetchPendingProfessionals();
          }
        } catch (error) {
          console.error("Error approving professional:", error);
        }
      },
  
      // Reject professional
      async rejectProfessional(id) {
        try {
          const response = await fetch(`/action_professional/${id}/reject`);
          if (response.ok) {
            alert('Professional rejected');
            await this.fetchPendingProfessionals();
          }
        } catch (error) {
          console.error("Error rejecting professional:", error);
        }
      },
  
      // Block low-rated professional
      async blockProfessional(id) {
        try {
          const response = await fetch(`/action_professional/${id}/block`);
          if (response.ok) {
            alert('Professional blocked');
            await this.fetchLowRatedProfessionals();
          }
        } catch (error) {
          console.error("Error blocking professional:", error);
        }
      },
  
      // Fetch low-rated professionals
      async fetchLowRatedProfessionals() {
        try {
          const response = await fetch('/home_admin/low_rated_professionals');
          const data = await response.json();
          this.lowRatedProfessionals = data.lowRatedProfessionals;
        } catch (error) {
          console.error("Error fetching low-rated professionals:", error);
        }
      },
  
      // Fetch pending service requests
      async fetchPendingRequests() {
        try {
          const response = await fetch('/home_admin/pending_requests');
          const data = await response.json();
          this.pendingRequests = data.pendingRequests;
        } catch (error) {
          console.error("Error fetching pending requests:", error);
        }
      },
  
      // Delete a service request
      async deleteRequest(requestId) {
        try {
          const response = await fetch(`/delete_request/${requestId}`);
          if (response.ok) {
            alert('Request deleted');
            await this.fetchPendingRequests();
          }
        } catch (error) {
          console.error("Error deleting request:", error);
        }
      },
  
      // View service request details
      async viewRequest(id) {
        try {
          const response = await fetch(`/view_request/${id}`);
          const data = await response.json();
          this.selectedRequest = data;
          this.showRequestModal = true;
        } catch (error) {
          console.error("Error viewing request:", error);
        }
      },
  
      // View professional details
      viewProfessional(professional) {
        this.selectedProfessional = professional;
        this.showProfessionalModal = true;
      },
  
      // Close modals
      closeRequestModal() {
        this.showRequestModal = false;
      },
      closeEditModal() {
        this.showEditModal = false;
      },
      closeProfessionalModal() {
        this.showProfessionalModal = false;
      },
    },
    template: `
      <div id="adminDashboard" class="container mt-5">
        <h2>Admin Dashboard</h2>
  
        <!-- Add New Service -->
        <form id="addServiceForm" @submit.prevent="addService" class="mb-5">
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
              <th>Service Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="professional in pendingProfessionals" :key="professional.id">
              <td>{{ professional.username }}</td>
              <td>{{ professional.service_type }}</td>
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
            <p><strong>Service Type:</strong> {{ selectedProfessional.service_type }}</p>
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
              <td>{{ request.service_name }}</td>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="professional in lowRatedProfessionals" :key="professional.id">
              <td>{{ professional.username }}</td>
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
  