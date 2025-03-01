// export default {
//     name: "Base",
//     data() {
//       return {
//         userId: this.$route.params.userId || null, // Dynamically get userId from route params
//         role: null, // Role of the user (Admin, Customer, Professional, or null)
//         routes: [], // Navigation routes based on role
//       };
//     },
//     created() {
//       this.initializeRole();
//     },
//     watch: {
//       "$route.params.userId"(newId) {
//         this.userId = newId;
//         this.updateRoutes();
//       },
//     },
//     methods: {
//       // Initialize the role and set the routes
//       initializeRole() {
//         // Example: Fetch the role from localStorage or an API
//         this.role = localStorage.getItem("role") || null;
//         this.userId = localStorage.getItem("userId") || null;
//         this.auth_token = localStorage.getItem("auth_token") || null;
//         this.loggedIn = localStorage.getItem("loggedIn") || false;
//         // Update routes based on the role
//         this.updateRoutes();
//       },
  
//       // Update navigation routes dynamically based on the role
//       updateRoutes() {
//         console.log('Updating routes. loggedIn:', this.loggedIn, 'role:', this.role, 'UserId:', this.userId);
//         if (this.role === "Admin"  && this.userId ) {
//           this.routes = [
//             { name: "Home", path: `/home_admin/${this.userId}`, link: `/home_admin/${this.userId}` },
//             { name: "Search", path: `/search_admin/${this.userId}`, link: `/search_admin/${this.userId}` },
//             { name: "Summary", path: `/summary_admin/${this.userId}`, link: `/summary_admin/${this.userId}` },
//             { name: "Logout", path: "/login", link: "/login" },
//           ];
//         } else if (this.role === "Customer"  && this.userId ) {
//           this.routes = [
//             { name: "Customer Home", path: `/home_customer/${this.userId}`, link: `/home_customer/${this.userId}` },
//             { name: "Search", path: `/search_customer/${this.userId}`, link: `/search_customer/${this.userId}` },
//             { name: "Summary", path: `/summary_customer/${this.userId}`, link: `/summary_customer/${this.userId}` },
//             { name: "Logout", path: "/login", link: "/login" },
//           ];
//         } else if (this.role === "Professional" && this.userId ) {
//           this.routes = [
//             { name: " Professional Home", path: `/professional_home/${this.userId}`, link: `/professional_home/${this.userId}` },
//             { name: "Search", path: `/search_professional/${this.userId}`, link: `/search_professional/${this.userId}` },
//             { name: "Summary", path: `/summary_professional/${this.userId}`, link: `/summary_professional/${this.userId}` },
//             { name: "Logout", path: "/login", link: "/login" },
//           ];
//         } else {
//           // Default routes for unauthenticated users
//           this.routes = [
//             { name: "Services", path: "/", link: "/" },
//             { name: "Login", path: "/login", link: "/login" },
//             { name: "Admin Login", path: "/adminlogin", link: "/adminlogin" },
//             { name: "Register", path: "/register", link: "/register" },
//           ];
//         }
//       },
  
//       // Navigate to a specific route
//       navigateTo(route) {
//         this.$router.push(route);
//       },
//     },
//     template: `
//       <div class="container">
//         <header class="my-4">
//           <h1 class="text-center">A to Z Household Service</h1>
//         </header>
  
//         <!-- Navigation Bar -->
//         <nav class="navbar navbar-expand-lg navbar-light bg-light">
//           <div class="container-fluid">
//             <button
//               class="navbar-toggler"
//               type="button"
//               data-bs-toggle="collapse"
//               data-bs-target="#navbarNav"
//               aria-controls="navbarNav"
//               aria-expanded="false"
//               aria-label="Toggle navigation"
//             >
//               <span class="navbar-toggler-icon"></span>
//             </button>
//             <div class="collapse navbar-collapse" id="navbarNav">
//               <ul class="navbar-nav">
//                 <!-- Dynamically render nav links -->
//                 <li v-for="(route, index) in routes" :key="index" class="nav-item">
//                   <router-link :to="route.path" class="nav-link">{{ route.name }}</router-link>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </nav>
          
//         <router-view></router-view>

//         <footer class="text-center my-4">
//             <p>&copy; Sagandeep Kaur</p>
//         </footer>
//       </div>
//     `,
//   };

// Base.js
import { mapGetters } from 'vuex'

export default {
  name: "Base",
  computed: {
    ...mapGetters(['isLoggedIn', 'userRole', 'userId']),
    routes() {
      if (this.userRole === "Admin" && this.userId) {
        return [
          { name: "Home", path: `/home_admin/${this.userId}` },
          { name: "Search", path: "/search_admin" },
          { name: "Summary", path: `/summary_admin/${this.userId}` },
          { name: "Logout", path: "/login" },
        ];
      } else if (this.userRole === "Customer" && this.userId) {
        return [
          { name: "Customer Home", path: `/home_customer/${this.userId}` },
          { name: "Search", path: "/search_customer" },
          { name: "Summary", path: `/summary_customer/${this.userId}` },
          { name: "Logout", path: "/login" },
        ];
      } else if (this.userRole === "Professional" && this.userId) {
        return [
          { name: "Professional Home", path: `/home_professional/${this.userId}` },
          { name: "Search", path: `/search_professional/${this.userId}` },
          { name: "Summary", path: `/summary_professional/${this.userId}` },
          { name: "Logout", path: "/login" },
        ];
      } else {
        return [
          { name: "Services", path: "/" },
          { name: "Login", path: "/login" },
          { name: "Admin Login", path: "/adminlogin" },
          { name: "Register", path: "/register" },
        ];
      }
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    redirectToHome(){
      if (this.userId && this.userRole) {
        switch(this.userRole) {
          case 'Admin':
            this.$router.push(`/home_admin/${this.userId}`);
            break;
          case 'Customer':
            this.$router.push(`/home_customer/${this.userId}`);
            break;
          case 'Professional':
            this.$router.push(`/professional_home/${this.userId}`);
            break;
          }
      }
    }
  },
  mounted() {
    this.redirectToHome();
  },
  template: `
    <div class="container">
      <header class="my-4">
        <h1 class="text-center">A to Z Household Service</h1>
      </header>

      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
              <li v-for="(route, index) in routes" :key="index" class="nav-item">
                <router-link :to="route.path" class="nav-link" @click="route.name === 'Logout' ? logout() : null">{{ route.name }}</router-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
        
      <router-view></router-view>

      <footer class="text-center my-4">
          <p>&copy; Sagandeep Kaur</p>
      </footer>
    </div>
  `,
};
