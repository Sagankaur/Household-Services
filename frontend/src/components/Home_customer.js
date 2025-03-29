import axios from "axios";

export default {
  name: "HomeCustomer",
  data() {
    return {
      userId: null,
      isEditing: false,
      isEditingServiceReq :false,
      customer: {
        id: null,
        customer: {},
        updatedUser: {},
        serviceHistory: [],
        selectedRequest: {},
        ratings: null,
        review: "",
        showReviewModal: false,
        showRequestModal: false,
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
        const response = await axios.get(
          `http://localhost:5000/home_customer/${this.userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response data:", response.data);

        if (response.data && response.data.customer_user) {
          this.customer.customer = response.data.customer_user;
          this.customer.updatedUser = { ...response.data.customer_user };
        } else {
          console.error("Customer user data is missing in the response");
        }

        if (response.data && response.data.service_history) {
          this.customer.serviceHistory = response.data.service_history;
        } else {
          console.error("Service history data is missing in the response");
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
        const response = await axios.put(
          `http://localhost:5000/home_customer/${this.userId}`,
          this.customer.updatedUser,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.$store.getters.authToken}`,
            },
          }
        );
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
        const response = await axios.get(
          `http://localhost:5000/view_request/${requestId}`,
          {
            headers: {
              Authorization: `Bearer ${this.$store.getters.authToken}`,
            },
          }
        );
        console.log("View Reques data", this.customer)
        this.customer.selectedRequest = response.data;
        this.customer.showRequestModal = true;
        // console.log("showRequestModal set to:", this.customer.showRequestModal); // Debug
        console.log("selectedRequest:", this.customer.selectedRequest); 
        // {c_address: '123 Cust new, USA', c_phone: '5666699', c_pincode: '122200', customer_name: 'cust1', customer_username: 'cust'}
      } catch (error) {
        console.error("Error fetching request details:", error);
      }
    },
    async completeRequest(requestId) {
      try {
        const response = await axios.get(
          `http://localhost:5000/view_request/${requestId}`,
          {
            headers: {
              Authorization: `Bearer ${this.$store.getters.authToken}`,
            },
          }
        );
        this.customer.selectedRequest = response.data;
        this.customer.showReviewModal = true;
        console.log("showReviewModal set to:", this.customer.showReviewModal); // Debug
        console.log("completeRequest selectedRequest:", this.customer.selectedRequest);
      } catch (error) {
        console.error("Error fetching request details:", error);
      }
    },
    async submitReview() {
      if (this.customer.ratings && this.customer.review) {
        try {

          if (!this.customer.selectedRequest || !this.customer.selectedRequest.id) {
            console.warn("selectedRequest is not properly set. Cannot submit review.");
            alert("Unable to submit review: Request information is missing. Please try again.");
            this.closeReviewModal();  // Close modal to prevent submission with bad data
            return; // Exit the method
          }
          console.log("cus",this.customer);
          console.log("rating",this.customer.ratings); //2
          console.log("req_id",this.customer.selectedRequest.id);
          const response = await axios.put(
            `http://localhost:5000/close_request/${this.userId}/${this.customer.selectedRequest.id}`,
            {
              rating: this.customer.ratings,
              review: this.customer.review,
            },
            {
              headers: {
                Authorization: `Bearer ${this.$store.getters.authToken}`,
              },
            }
          );
          console.log(response.data);
          this.closeReviewModal();
          this.customer.ratings = null;
          this.customer.review = "";
          this.fetchData();
        } catch (error) {
          console.error("Error submitting review:", error);
          alert("An error occurred while submitting the review.");
        }
      } else {
        alert("Please provide a rating and feedback.");
      }
    },
    async editRequest(requestId) {
      try {
          const updatedData = {
              c_address: this.customer.selectedRequest?.c_address,
              c_pincode: this.customer.selectedRequest?.c_pincode,
              c_phone: this.customer.selectedRequest?.c_phone,
              date_of_request: this.customer.selectedRequest?.date_of_request,
              review: this.customer.selectedRequest?.review,
              rating: this.customer.selectedRequest?.rating,
              remarks: this.customer.selectedRequest?.remarks
          };
  
          const response = await axios.put(
              `http://localhost:5000/view_request/${requestId}`,
              updatedData,  // Pass data to update
              {
                  headers: {
                      Authorization: `Bearer ${this.$store.getters.authToken}`,
                      "Content-Type": "application/json",
                  },
              }
          );
  
          this.customer.selectedRequest = response.data.request;
          alert("Service request updated successfully!");
          this.isEditingServiceReq = false;
      } catch (error) {
          console.error("Error updating request:", error);
          alert("Failed to update request. Please try again.");
    
      }
    },  
    closeRequestModal() {
      this.customer.showRequestModal = false;
      this.customer.selectedRequest = {};
    },
    closeReviewModal() {
      this.customer.showReviewModal = false;
      this.customer.selectedRequest = {};
    },
  },
  template: `
  <div id="app" class="container mt-5">
    <h2>{{ customer.customer.name }} Dashboard</h2>
    <!-- Edit Profile Section (unchanged) -->
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

    <!-- Profile Overview Section (unchanged) -->
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
    <!-- Service Request Modal -->
    <div v-if="customer.showRequestModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeRequestModal">&times;</span>
        <h4>Service Request Details</h4>
        <p><strong>Professional Username:</strong> {{ customer.selectedRequest?.professional_username || "N/A" }}</p>
        <p><strong>Professional Name:</strong> {{ customer.selectedRequest?.professional_name || "N/A" }}</p>
        <p><strong>Address:</strong> {{ customer.selectedRequest?.c_address || "N/A" }}</p>
        <p><strong>Pincode:</strong> {{ customer.selectedRequest?.c_pincode || "N/A" }}</p>
        <p><strong>Phone:</strong> {{ customer.selectedRequest?.p_phone || "N/A" }}</p>
        <p><strong>Service:</strong> {{ customer.selectedRequest?.service || "N/A" }}</p>
        <p><strong>Date of Request:</strong> {{ customer.selectedRequest?.date_of_request || "N/A" }}</p>
        <p><strong>Review:</strong> {{ customer.selectedRequest?.review || "N/A" }}</p>

        <!-- Edit Button for Pending Requests -->
        <button class="btn btn-primary btn-sm" @click="isEditingServiceReq = true" >
          Edit Your Details
        </button>

        <!-- Toggle Edit Mode -->
        <div v-if="isEditingServiceReq">
          <div v-if="customer.selectedRequest?.service_status === 'closed'">
            <label><strong>Review:</strong></label>
            <input v-model="customer.selectedRequest.review" type="text" />

            <label><strong>Rating:</strong></label>
            <input v-model="customer.selectedRequest.rating" type="number" min="1" max="5" />
          </div>

          <div v-else>
            <label><strong>Address:</strong></label>
            <input v-model="customer.selectedRequest.c_address" type="text" />

            <label><strong>Pincode:</strong></label>
            <input v-model="customer.selectedRequest.c_pincode" type="text" />

            <label><strong>Phone:</strong></label>
            <input v-model="customer.selectedRequest.c_phone" type="text" />

            <label><strong>Date of Request:</strong></label>
            <input v-model="customer.selectedRequest.date_of_request" type="date" />

            <label><strong>Remarks:</strong></label>
            <input v-model="customer.selectedRequest.remarks" type="text" />
          </div>

          <!-- Save and Cancel Buttons -->
          <button class="btn btn-success btn-sm" @click="editRequest(customer.selectedRequest?.id)">
            Save Changes
          </button>
          <button class="btn btn-secondary btn-sm" @click="isEditingServiceReq = false">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
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
        <button type="button" @click="submitReview" class="btn btn-primary">
          Submit Review
        </button>
      </div>
    </div>

    <!-- Service History Table -->
    <div class="card mt-4">
      <h4>Service History</h4>
      <div class="card-body">
        <table v-if="customer.serviceHistory.length > 0" class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Status</th>
              <th>Request Date</th>
              <th>Ratings</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in customer.serviceHistory" :key="request.id">
              <td>{{ request.id }}</td>
              <td>{{ request.service }}</td>
              <td>{{ request.service_status }}</td>
              <td>{{ request.date_of_request }}</td>
              <td>{{ request.rating || "N/A" }}</td>
              <td>
                <button class="btn btn-info btn-sm" @click="viewRequest(request.id)">
                  View
                </button>

                <button
                  class="btn btn-success btn-sm"
                  @click="completeRequest(request.id)"
                  v-if="request.service_status === 'pending'">
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
  `,
};
