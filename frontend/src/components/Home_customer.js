// only table visible. check view request 
import axios from 'axios';

export default {
    name: 'HomeCustomer',
    data() {
        return {
            userId: null,
            isEditing: false,
            customer: {
                id: null,
                customer: {},
                updatedUser: {},
                serviceHistory: [],
                showRequestModal: false,
                selectedRequest: {},
                ratings: null,
                review: '',
                showReviewModal: false
            },
        };
    },
    created() {
        this.userId = this.$store.getters.userId;
        console.log("userId from store:", this.userId);
        if (this.userId) {
            this.fetchData();
        } else {
            console.error("No userId found in store");
            // Redirect to login or handle this error case
        }
    },
    methods: {
        async fetchData() {
            try {
                const token = this.$store.getters.authToken;
                const response = await axios.get(`http://localhost:5000/home_customer/${this.userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                console.log('Response data:', response.data);

                if (response.data && response.data.customer_user) {
                    this.customer.customer = response.data.customer_user;
                    this.customer.updatedUser = { ...response.data.customer_user };
                } else {
                    console.error('Customer user data is missing in the response');
                }

                if (response.data && response.data.service_history) {
                    this.customer.serviceHistory = response.data.service_history;
                } else {
                    console.error('Service history data is missing in the response');
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                if (error.response) {
                    console.error("Response data:", error.response.data);
                    console.error("Response status:", error.response.status);
                }
            }
        },
        async updateProfile() {
            try {
                const response = await axios.put(`http://localhost:5000/home_customer/${this.userId}`, this.customer.updatedUser, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.$store.getters.authToken}`
                    }
                });
                this.customer.customer = { ...this.customer.updatedUser };
                alert(response.data.message);
                this.isEditing = false;
            } catch (error) {
                console.error("Error updating profile:", error);
            }
        },
        editProfile() {
            this.isEditing = true;
        },
        cancelEdit() {
            this.isEditing = false;
        },
        async viewRequest(requestId) {
            try {
                const response = await axios.get(`http://localhost:5000/view_request/${requestId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.$store.getters.authToken}`
                    }
                });
                this.customer.selectedRequest = response.data;
                this.customer.showRequestModal = true;
            } catch (error) {
                console.error("Error fetching request details:", error);
            }
        },
        async completeRequest(requestId) {
            try {
                const response = await axios.put(`http://localhost:5000/close_request/${this.userId}/${requestId}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${this.$store.getters.authToken}`
                    }
                });
                this.customer.selectedRequestReview = response.data;
                this.customer.showReviewModal = true;
            } catch (error) {
                console.error("Error fetching request details:", error);
            }
        },
        async submitReview() {
            if (this.customer.ratings && this.customer.review) {
                try {
                    // Send the rating and feedback to the backend
                    const response = await axios.put(`http://localhost:5000/close_request/${this.userId}/${this.customer.selectedRequest.id}`, {
                        rating: this.customer.ratings,
                        feedback: this.customer.review,
                    }, {
                        headers: {
                            'Authorization': `Bearer ${this.$store.getters.authToken}`
                        }
                    });
                    console.log(response.data);
                    this.closeReviewModal(); // Close the modal after submitting the review... // Optionally reset the form fields
                    this.customer.ratings = null;
                    this.customer.review = '';
                    this.fetchData();
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
  <div id="app" class="container mt-5">
    <h2>{{ customer.customer.name }} Dashboard</h2>
    <div v-if="isEditing" class="card mt-4">
      <div class="card-header">
        <h4>Edit Profile</h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="updateProfile">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" id="username" v-model="customer.updatedUser.username" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input type="text" id="name" v-model="customer.updatedUser.name" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" v-model="customer.updatedUser.email" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="phone" class="form-label">Phone</label>
            <input type="text" id="phone" v-model="customer.updatedUser.phone_number" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="address" class="form-label">Address</label>
            <input type="text" id="address" v-model="customer.updatedUser.address" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="pincode" class="form-label">Pincode</label>
            <input type="text" id="pincode" v-model="customer.updatedUser.pincode" class="form-control" required>
          </div>
          <button type="submit" class="btn btn-primary">Update Profile</button>
        </form>
        <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
    <div v-if="!isEditing" class="profile-overview">
      <ul>
          <li><strong>Username:</strong> {{ customer.customer.username }}</li>
          <li><strong>Email:</strong> {{ customer.customer.email }}</li>
          <li><strong>Phone:</strong> {{ customer.customer.phone_number }}</li>
          <li><strong>Address:</strong> {{ customer.customer.address }}</li>
          <li><strong>Pincode:</strong> {{ customer.customer.pincode }}</li>
        </ul>
      <button @click="editProfile" class="btn btn-primary">Edit Profile</button>
    </div>

    <div v-if="customer.showRequestModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeRequestModal">&times;</span>
        <h4>Service Request Details</h4>
        <p><strong>Professional Username:</strong> {{ customer.selectedRequest?.professional_username || 'N/A' }}</p>
        <p><strong>Professional Name:</strong> {{ customer.selectedRequest?.professional_name || 'N/A' }}</p>
        <p><strong>Address:</strong> {{ customer.selectedRequest?.address || 'N/A' }}</p>
        <p><strong>Pincode:</strong> {{ customer.selectedRequest?.pincode || 'N/A' }}</p>
        <p><strong>Phone:</strong> {{ customer.selectedRequest?.p_phone || 'N/A' }}</p>
        <p><strong>Service:</strong> {{ customer.selectedRequest?.service || 'N/A' }}</p>
        <p><strong>Date of Request:</strong> {{ customer.selectedRequest?.date_of_request || 'N/A' }}</p>
        <p><strong>Review:</strong> {{ customer.selectedRequest?.review || 'N/A' }}</p>
      </div>
    </div>
    <div class="card mt-4">
      <div class="card-body">
        <!-- Show modal if showReviewModal is true -->
        <div v-if="customer.showReviewModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeReviewModal">&times;</span>
            <h4>Rate and Review Service</h4>
            <!-- Rating Select -->
            <div class="mb-3">
              <label for="rating" class="form-label">Rating:</label>
              <select v-model="customer.ratings" id="rating" class="form-select" required>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <!-- Feedback Textarea -->
            <div class="mb-3">
              <label for="review" class="form-label">Review:</label>
              <textarea v-model="customer.review" id="review" class="form-control" rows="3"></textarea>
            </div>

            <!-- Submit Button -->
            <button type="button" @click="submitReview" class="btn btn-primary">Submit Review</button>
          </div>
        </div>
      </div>

      <!-- Service History Table -->
      <div class="card mt-4">
      <h4>Service History</h4>
        <div class="card-body">
          <table v-if="customer.serviceHistory.length > 0" class="table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Ratings</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in customer.serviceHistory" :key="request.id">
                <td>{{ request.service }}</td>
                <td>{{ request.service_status }}</td>
                <td>{{ request.date_of_request }}</td>
                <td>{{ request.ratings || 'N/A' }}</td>
                <td>
                  <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">View</button>
                  <button class="btn btn-success btn-sm" @click="completeRequest(request.id)" v-if="request.status === 'pending'">
                    Rate and Close
                  </button>
                  <span v-else>Closed</span>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else>No service history available.</p>
        </div>
      </div>
    </div>
  </div>
  `
};
