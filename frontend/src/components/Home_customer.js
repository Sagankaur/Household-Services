// import axios from 'axios';
// export default {
//     name: 'HomeCustomer',
//     props: ['userId'],
//     data() {
//       return {
//         isEditing: false,
//         customer: {
//           id: null,
//           customer: {}, // Customer details
//           updatedUser : {}, 
//           serviceHistory: [], // Service history list
//           showRequestModal: false,
//           selectedRequest: {}, // Details for modal
//           isEditing: false,
//           ratings: null,           
//           review: '',
//         },
//       };
//     },
//     mounted() {
//       const userId = this.$route.params.userId;
//       this.fetchData(userId);
//     },
//     methods: {
//         async fetchData(userId) {
//             try {
//                 const response = await axios.get(`/home_customer/${userId}`, {
//                     headers: {
//                         Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
//                     },
//                 });
//                 this.customer = response.data.customer_user;
//                 this.serviceHistory = response.data.service_history;
//                 this.updatedUser = { ...this.customer }; // Make a copy for editing
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//             }
//         },
//         async updateProfile(userId) {
//             try {
//                 const response = await axios.post(`/home_customer/${userId}`, this.customer);
//                 alert(response.data.message);
//                 this.isEditing = false;
//             } catch (error) {
//                 console.error("Error updating profile:", error);
//             }
//         },
//         editProfile() {
//             this.isEditing = true; // Show the profile edit form
//         },
//         cancelEdit() {
//             this.isEditing = false; // Hide the edit form and keep the original data
//         },
//         async viewRequest(requestId) {
//             try {
//                 const response = await axios.get(`/view_request/${requestId}`);
//                 this.selectedRequest = response.data;
//                 this.showRequestModal = true;
//             } catch (error) {
//                 console.error("Error fetching request details:", error);
//             }
//         },
//         async completeRequest(requestId) {
//             try {
//                 const response = await axios.get(`/close_request/${requestId}`);
//                 this.selectedRequestReview = response.data;
//                 this.showReviewModal = true;
//             } catch (error) {
//                 console.error("Error fetching request details:", error);
//             }
//         },
//         async submitReview(requestId) {
//             if (this.rating && this.feedback) {
//                 try {
//                     // Send the rating and feedback to the backend
//                     const response = await axios.post(`/close_request/${requestId}`, {
//                         rating: this.rating,
//                         feedback: this.feedback,
//                     });
//                     console.log(response.data);
//                     this.closeReviewModal();  // Close the modal after submitting the review

//                     // Optionally reset the form fields
//                     this.rating = null;
//                     this.feedback = '';
//                 } catch (error) {
//                     console.error('Error submitting review:', error);
//                     alert('An error occurred while submitting the review.');
//                 }
//             } else {
//                 alert('Please provide a rating and feedback.');
//             }
//         },
//         closeRequestModal() {
//             this.showRequestModal = false;
//             this.selectedRequest = {};
//         },
//         closeReviewModal() {
//             this.showReviewModal = false;
//             this.selectedRequestReview = {};
//         },
//     },

//     template: `
//     <div id="#app" class="container mt-5">
//         <h2>Customer Dashboard</h2>
//     <div v-if="isEditing" class="card mt-4">
//         <div class="card-header">
//             <h4>Edit Profile</h4>
//         </div>
//         <div class="card-body">
            
//                 <div class="mb-3">
//                     <label for="phone" class="form-label">Username</label>
//                     <input type="text" id="username" v-model="customer.username" class="form-control" required>
//                 </div>
//                 <div class="mb-3">
//                     <label for="name" class="form-label">Name</label>
//                     <input type="text" id="name" v-model="customer.name" class="form-control" required>
//                 </div>
//                 <div class="mb-3">
//                     <label for="email" class="form-label">Email</label>
//                     <input type="email" id="email" v-model="customer.email" class="form-control" required>
//                 </div>
//                 <div class="mb-3">
//                     <label for="phone" class="form-label">Phone</label>
//                     <input type="text" id="phone" v-model="customer.phone" class="form-control" required>
//                 </div>
//                 <div class="mb-3">
//                     <label for="phone" class="form-label">Address</label>
//                     <input type="text" id="address" v-model="customer.address" class="form-control" required>
//                 </div>
//                 <div class="mb-3">
//                     <label for="phone" class="form-label">Pincode</label>
//                     <input type="text" id="pincode" v-model="customer.pincode" class="form-control" required>
//                 </div>

//                 <button type="submit" class="btn btn-primary" @submit.prevent="updateProfile">Update Profile</button>

//             <button @click="cancelEdit">Cancel</button>
//         </div>
//     </div>
    
//     <div v-if="!isEditing" class="profile-overview">
//         <h3>{{ customer.name }}</h3>
//         <p>{{ customer.email }}</p>
//         <p>{{ customer.phone }}</p>
//         <p>{{ customer.address }}</p>
//         <button @click="editProfile">Edit Profile</button>
//     </div>

//     <div class="card mt-4">
//         <div class="card-body">
//             <div v-if="showRequestModal" class="modal"> 
//                 <div class="modal-content"> 
//                     <span class="close" @click="closeRequestModal">&times;</span> 
//                     <h4>Service Request Details</h4> 
//                     <p><strong>Professional Username:</strong> {{ selectedRequest.professional_username }}</p>
//                     <p><strong>Professional Name:</strong> {{ selectedRequest.professional_name }}</p> 
//                     <p><strong>Address:</strong> {{ selectedRequest.address }}</p> 
//                     <p><strong>Pincode:</strong> {{ selectedRequest.pincode }}</p> 
//                     <p><strong>Phone:</strong> {{ selectedRequest.p_phone }}</p>  
//                     <p><strong>Service:</strong> {{ selectedRequest.service }}</p> 
//                     <p><strong>Date of Request:</strong> {{ selectedRequest.date_of_request }}</p> 
//                     <p><strong>Review:</strong> {{ selectedRequest.review }}</p> 
//                 </div> 
//             </div>
//             <div class="card mt-4">
//                 <div class="card-body">
//                     <!-- Show modal if showReviewModal is true -->
//                     <div v-if="showReviewModal" class="modal">
//                         <div class="modal-content">
//                             <h4>Rate and Close</h4>
                            
//                             <!-- Rating Select -->
//                             <div class="form-group">
//                                 <label for="rating">Rating:</label>
//                                 <select v-model="ratings" id="rating" required class="form-control">
//                                     <option value="1">1 Star</option>
//                                     <option value="2">2 Stars</option>
//                                     <option value="3">3 Stars</option>
//                                     <option value="4">4 Stars</option>
//                                     <option value="5">5 Stars</option>
//                                 </select>
//                             </div>
            
//                             <!-- Feedback Textarea -->
//                             <div class="form-group">
//                                 <label for="review">Review:</label>
//                                 <textarea v-model="review" id="review" class="form-control" rows="3"></textarea>
//                             </div>
            
//                             <!-- Submit Button -->
//                             <button type="button" @click="submitReview" class="btn btn-primary">
//                                 Submit Review
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
            
//             <!-- Service History Table -->
//             <h4>Service History</h4>
//             <table>
//                 <tr>
//                     <th>Service Type</th>
//                     <th>Status</th>
//                     <th>Request Date</th>
//                     <th>Ratings</th>
//                     <th>Action</th>
//                 </tr>
//                 {% for request in service_history %}
//                 <tr>
//                     <td>{{ request.service_type }}</td>
//                     <td>{{ request.status }}</td>
//                     <td>{{ request.request_date.strftime('%Y-%m-%d') }}</td>
//                     <td>{{ request.ratings or 'None' }}</td>
//                     <td>
//                         <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
//                         {% if request.status == 'pending' %}
//                         <button class="btn btn-info btn-sm" @click="completeRequest(request.id)">Close</button>
//                         {% else %}
//                             Closed
//                         {% endif %}
//                     </td>
//                 </tr>
//                 {% endfor %}
//             </table>
//         </div>
//     </div>

//     `
//   };
  

import axios from 'axios';

export default {
  name: 'HomeCustomer',
  data() {
    return {
      isEditing: false,
      customer: {
        id: null,
        customer: {}, // Customer details
        updatedUser: {},
        serviceHistory: [],
        showRequestModal: false,
        selectedRequest: {},
        isEditing: false,
        ratings: null,
        review: '',
      },
    };
  },
  mounted() {
    const userId = this.$route.params.userId;
    this.fetchData(userId);
  },
  methods: {
    async fetchData(userId) {
      try {
        const token = this.$store.getters.authToken; // Use Vuex state
        const response = await axios.get(`http://localhost:5000/home_customer/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
            },
        });

        this.customer.customer = response.data.user; // Directly assign customer details
        this.customer.serviceHistory = response.data.serviceRequests; // Directly assign service history
        this.customer.updatedUser = { ...this.customer.customer };
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    async updateProfile() {
      try {
        const userId = this.$route.params.userId;
        const response = await axios.post(`http://localhost:5000/home_customer/${userId}`, this.customer.customer, {
            headers: {
              'Content-Type': 'application/json'
            }
        });
        alert(response.data.message);
        this.isEditing = false;
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    },
    editProfile() {
      this.isEditing = true; // Show the profile edit form
    },
    cancelEdit() {
      this.isEditing = false; // Hide the edit form and keep the original data
    },
    async viewRequest(requestId) {
      try {
        const response = await axios.get(`http://localhost:5000/view_request/${requestId}`);
        this.customer.selectedRequest = response.data;
        this.customer.showRequestModal = true;
      } catch (error) {
        console.error("Error fetching request details:", error);
      }
    },
    async completeRequest(requestId) {
      try {
        const response = await axios.get(`http://localhost:5000/close_request/${requestId}`);
        this.customer.selectedRequestReview = response.data;
        this.customer.showReviewModal = true;
      } catch (error) {
        console.error("Error fetching request details:", error);
      }
    },
    async submitReview(requestId) {
      if (this.customer.ratings && this.customer.review) {
        try {
          // Send the rating and feedback to the backend
          const response = await axios.post(`http://localhost:5000/close_request/${requestId}`, {
            rating: this.customer.ratings,
            feedback: this.customer.review,
          });
          console.log(response.data);
          this.closeReviewModal();  // Close the modal after submitting the review

          // Optionally reset the form fields
          this.customer.ratings = null;
          this.customer.review = '';
        } catch (error) {
          console.error('Error submitting review:', error);
          alert('An error occurred while submitting the review.');
        }
      } else {
        alert('Please provide a rating and feedback.');
      }
    },
    closeRequestModal() {
      this.customer.showRequestModal = false;
      this.customer.selectedRequest = {};
    },
    closeReviewModal() {
      this.customer.showReviewModal = false;
      this.customer.selectedRequestReview = {};
    },
  },
  template: `
    <div id="#app" class="container mt-5">
      <h2>Customer Dashboard</h2>
      <div v-if="isEditing" class="card mt-4">
        <div class="card-header">
          <h4>Edit Profile</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="updateProfile">
            <div class="mb-3">
              <label for="username" class="form-label">Username</label>
              <input type="text" id="username" v-model="customer.customer.username" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="name" class="form-label">Name</label>
              <input type="text" id="name" v-model="customer.customer.name" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" v-model="customer.customer.email" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="phone" class="form-label">Phone</label>
              <input type="text" id="phone" v-model="customer.customer.phone_number" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="address" class="form-label">Address</label>
              <input type="text" id="address" v-model="customer.customer.address" class="form-control" required>
            </div>
            <div class="mb-3">
              <label for="pincode" class="form-label">Pincode</label>
              <input type="text" id="pincode" v-model="customer.customer.pincode" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Update Profile</button>
          </form>
          <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
        </div>
      </div>

      <div v-if="!isEditing" class="profile-overview">
        <h3>{{ customer.customer.name }}</h3>
        <p>{{ customer.customer.email }}</p>
        <p>{{ customer.customer.phone_number }}</p>
        <p>{{ customer.customer.address }}</p>
        <button @click="editProfile" class="btn btn-primary">Edit Profile</button>
      </div>
        <div v-if="customer.showRequestModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="closeRequestModal">&times;</span>
                <h4>Service Request Details</h4>
                <p><strong>Professional Username:</strong> {{ customer.selectedRequest.professional_username }}</p>
                <p><strong>Professional Name:</strong> {{ customer.selectedRequest.professional_name }}</p>
                <p><strong>Address:</strong> {{ customer.selectedRequest.address }}</p>
                <p><strong>Pincode:</strong> {{ customer.selectedRequest.pincode }}</p>
                <p><strong>Phone:</strong> {{ customer.selectedRequest.p_phone }}</p>
                <p><strong>Service:</strong> {{ customer.selectedRequest.service }}</p>
                <p><strong>Date of Request:</strong> {{ customer.selectedRequest.date_of_request }}</p>
                <p><strong>Review:</strong> {{ customer.selectedRequest.review }}</p>
            </div>
        </div>
      <div class="card mt-4">
        <div class="card-body">
          <!-- Show modal if showReviewModal is true -->
          <div v-if="customer.showReviewModal" class="modal">
            <div class="modal-content">
              <h4>Rate and Close</h4>

              <!-- Rating Select -->
              <div class="form-group">
                <label for="rating">Rating:</label>
                <select v-model="customer.ratings" id="rating" required class="form-control">
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              <!-- Feedback Textarea -->
              <div class="form-group">
                <label for="review">Review:</label>
                <textarea v-model="customer.review" id="review" class="form-control" rows="3"></textarea>
              </div>

              <!-- Submit Button -->
              <button type="button" @click="submitReview" class="btn btn-primary">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Service History Table -->
      <h4>Service History</h4>
      <table class="table">
        <thead>
          <tr>
            <th>Service Type</th>
            <th>Status</th>
            <th>Request Date</th>
            <th>Ratings</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in customer.serviceHistory" :key="request.id">
            <td>{{ request.service_type }}</td>
            <td>{{ request.status }}</td>
            <td>{{ request.request_date }}</td>
            <td>{{ request.ratings || 'None' }}</td>
            <td>
              <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
              <button class="btn btn-info btn-sm" @click="completeRequest(request.id)" v-if="request.status == 'pending'">
                  Close
              </button>
              <span v-else>Closed</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
};
