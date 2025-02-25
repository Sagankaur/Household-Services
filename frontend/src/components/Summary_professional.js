import axios from 'axios';
export default {
    name: 'SummaryProfessional',
    data() {
      return {
        bar_chart_prof: null, 
        pie_chart_prof: null,
        avg_rate : 0
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
          const response = await axios.get(`/summary_professional/${userId}`);
          
          // Store the chart image path
          this.bar_chart_prof = response.data.bar_chart_prof;
          this.pie_chart_prof = response.data.pie_chart_prof;
          this.avg_rate= response.data.average_rating;
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },
    },
  
    template: `
      <div id="app" class="container mt-5">
        <h2>Professional Summary</h2>
        <div>
          <h3>Status Counts</h3>
          <!-- Display the chart image fetched from the backend -->
          <img v-if="bar_chart_prof" :src="bar_chart_prof" alt="status_counts Bar Chart">
          <p v-else>Loading chart...</p>
        </div>
        <div>
          <h2>Average Ratings: {{ avg_rate.toFixed(2) }} Stars </h2>
          <h3> Ratings </h3>
          <!-- Display the chart image fetched from the backend -->
          <img v-if="pie_chart_prof" :src="pie_chart_prof" alt="rating_counts Pie Chart">
          <p v-else>Loading chart...</p>
        </div>
      </div>
    `,
  };
  