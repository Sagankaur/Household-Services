// http://localhost:5000/static/charts/bar_chart_prof_d1426de6d42f4e88b99911d8c89391af.png        
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
          const response = await axios.get(`http://localhost:5000/summary_professional/${this.userId}`, { 
            headers: { Authorization: `Bearer ${token}` }
          });
        
          console.log("Full sumry:", response.data);

          this.bar_chart_prof = response.data.bar_chart_prof;
          this.pie_chart_prof = response.data.pie_chart_prof;
          this.avg_rate= response.data.average_rating;

          console.log("after", this.bar_chart_prof);

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      },
    },
  
    template: `
    <div id="app" class="container mt-5">
        <h2>Professional Summary</h2>
      <div class="star">
        <h3>Average Ratings: {{ avg_rate.toFixed(2) }} ⭐ </h3>
      </div>

      <div class ='bar_chart'>
          <h3>Status Counts</h3>
          <!-- Display the chart image fetched from the backend -->
          <img v-if="bar_chart_prof" :src="bar_chart_prof" alt="status_counts Bar Chart">
          
          <p v-else>Loading chart...</p>
        </div>

        <div class ='pie_chart'>
          <h3> Ratings </h3>
          <!-- Display the chart image fetched from the backend -->
          <img v-if="pie_chart_prof" :src="pie_chart_prof" alt="rating_counts Pie Chart">
          <p v-else>Loading chart...</p>
        </div>
      </div>
    `
  };
  
// // before static/charts/bar_chart_prof_20250308011120.png
// // after static/charts/bar_chart_prof_20250308011120.png
// //GET http://localhost:8080/summary_professional/static/charts/bar_chart_prof_20250308011120.png
// Actual path D:\IIT\Mad\household_v2\backend\static\charts

// '/backend/static/charts/' +   .split('/').pop()
// <img :src="`/static/charts/${this.bar_chart_prof}`" alt="status_counts Bar Chart">
//{/* <img :src="`/static/charts/${this.pie_chart_prof}`" alt="rating_counts Pie Chart"> */}
