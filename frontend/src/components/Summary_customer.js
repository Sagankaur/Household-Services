import axios from 'axios';
export default {
    name: 'CustomerSummary',
    data() {
      return {
        bar_graph_path_customer: null, // Store the chart image path
      };
    },
  
    mounted() {
      const userId = this.$route.params.userId;
      // const role = this.$route.params.role;
      this.fetchChartData(userId);
    },
  
    methods: {
      async fetchChartData(userId) {
        try {
          // Make an API call to get the chart data
          const response = await axios.get(`/summary_customer/${userId}`);
          
          // Store the chart image path
          this.bar_graph_path_customer = response.data.bar_graph_path_customer;
        } catch (error) {
          console.error('Error fetching service status data:', error);
        }
      },
    },
  
    template: `
      <div id="app" class="container mt-5">
        <h2>Customer Summary</h2>
        <div>
          <h3>Service Request Status Overview</h3>
          <!-- Display the chart image fetched from the backend -->
          <img v-if="bar_graph_path_customer" :src="bar_graph_path_customer" alt="Service Requests Chart">
          <p v-else>Loading chart...</p>
        </div>
      </div>
    `,
  };
  