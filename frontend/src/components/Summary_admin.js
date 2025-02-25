import axios from 'axios';
export default {
    name: 'SummaryAdmin',
    data() {
      return {
        bar_graph_path_admin: null, 
        pie_chart_path_admin: null,
      };
    },
  
    mounted() {
      const userId = this.$route.params.user_id;  // Ensure user_id is passed as part of the route
      if (userId) {
        this.fetchChartData(userId);
      } else {
        console.error('User ID is not available');
      }
    },
  
    methods: {
      async fetchChartData(userId) {
        try {
          // Make an API call to get the chart data
          const response = await axios.get(`/summary_admin/${userId}`);
          
          // Store the chart image path
          this.bar_graph_path_admin = response.data.bar_graph_path_admin;
          this.pie_chart_path_admin = response.data.pie_chart_path_admin;
  
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },
    },
  
    template: `
      <div id="app" class="container mt-5">
        <h2>Admin Summary</h2>
        <div>
          <h3>Status Counts</h3>
          <!-- Display the chart image fetched from the backend -->
          <img v-if="bar_graph_path_admin" :src="bar_graph_path_admin" alt="Customer Ratings Bar Chart">
          <p v-else>Loading chart...</p>
        </div>
        <div>
          <h3>Ratings</h3>
          <!-- Display the chart image fetched from the backend -->
          <img v-if="pie_chart_path_admin" :src="pie_chart_path_admin" alt="Service Request Status Pie">
          <p v-else>Loading chart...</p>
        </div>
      </div>
    `,
  };
  