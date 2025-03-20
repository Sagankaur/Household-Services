import axios from 'axios';
export default {
    name: 'SummaryCustomer',
    data() {
      return {
        bar_graph_path_customer: null, // Store the chart image path
      };
    },
  
    created() {
      this.userId = this.$store.getters.userId;
      // console.log("userId from route:", this.$route.params.userId);
      console.log("userId from store:", this.$store.getters.userId);
      console.log("final userId:", this.userId);
      if (this.userId) {
          this.fetchChartData();
      } else {
          console.error("No userId found in route params or store");
          // Redirect to login or handle this error case
      }
    },
  
    methods: {
      async fetchChartData() {
        try {
          const token = this.$store.getters.authToken;
          const response = await axios.get(`/summary_customer/${this.userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
          console.log("Full sumry:", response.data);
          this.bar_graph_path_customer = response.data.bar_graph_path;
          console.log("bar_graph_path_customer:", this.bar_graph_path_customer);
        
        } catch (error) {
          console.error('Error fetching service status data:', error);
        }
      },
    },
  
    template: `
      <div id="app" class="container mt-5">
        <h2>Customer Summary</h2>
        <div class ='bar_chart'>
          <h3>Service Request Status</h3>
          <!-- Display the chart image fetched from the backend -->
          <img v-if="bar_graph_path_customer" :src="bar_graph_path_customer" alt="Service Requests Chart">
          <p v-else>Loading chart...</p>
        </div>
      </div>
    `,
  };
  