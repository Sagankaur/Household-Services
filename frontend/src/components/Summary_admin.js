import axios from 'axios';
export default {
    name: 'SummaryAdmin',
    data() {
      return {
        bar_graph_path_admin: null, 
        pie_chart_path_admin: null,
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
          // Make an API call to get the chart data
          const response = await axios.get(`/summary_admin/${this.userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
          // Store the chart image path
          console.log("Full sumry:", response.data);

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
        <div class='bar_chart'>
          <h3>Status Counts</h3>
          <!-- Display the chart image fetched from the backend -->
          <img v-if="bar_graph_path_admin" :src="bar_graph_path_admin" alt="Customer Ratings Bar Chart">
          <p v-else>Loading chart...</p>
        </div>
        <div class ='pie_chart'>
          <h3>Ratings</h3>
          <!-- Display the chart image fetched from the backend -->
          <img v-if="pie_chart_path_admin" :src="pie_chart_path_admin" alt="Service Request Status Pie">
          <p v-else>Loading chart...</p>
        </div>
      </div>
    `,
  };
  