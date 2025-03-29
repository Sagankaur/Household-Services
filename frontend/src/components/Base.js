// import { mapGetters } from 'vuex'

// export default {
//   name: "Base",
//   computed: {
//     ...mapGetters(['isAuth', 'userRole', 'userId']),
//     routes() {
//       if (this.userRole === "Admin" && this.userId) {
//         return [
//           { name: "Home", path: `/home_admin/${this.userId}` },
//           { name: "Search", path: `/search_admin/${this.userId}` },
//           { name: "Summary", path: `/summary_admin/${this.userId}` },
//           { name: "Logout", path: "/login" },
//         ];
//       } else if (this.userRole === "Customer" && this.userId) {
//         return [
//           { name: "Customer Home", path: `/home_customer/${this.userId}` },
//           { name: "Search", path: `/search_customer/${this.userId}` },
//           { name: "Summary", path: `/summary_customer/${this.userId}` },
//           { name: "Logout", path: "/login" },
//         ];
//       } else if (this.userRole === "Professional" && this.userId) {
//         return [
//           { name: "Professional Home", path: `/home_professional/${this.userId}` },
//           { name: "Search", path: `/search_professional/${this.userId}` },
//           { name: "Summary", path: `/summary_professional/${this.userId}` },
//           { name: "Logout", path: "/login" },
//         ];
//       } else {
//         return [
//           { name: "Services", path: "/" },
//           { name: "Login", path: "/login" },
//           { name: "Admin Login", path: "/adminlogin" },
//           { name: "Register", path: "/register" },
//         ];
//       }
//     }
//   },
//   methods: {
//     logout() {
//       this.$store.dispatch('logout')
//       this.$router.push('/login')
//     },
//     redirectToHome(){
//       if (this.userId && this.userRole) {
//         switch(this.userRole) {
//           case 'Admin':
//             this.$router.push(`/home_admin/${this.userId}`);
//             break;
//           case 'Customer':
//             this.$router.push(`/home_customer/${this.userId}`);
//             break;
//           case 'Professional':
//             this.$router.push(`/professional_home/${this.userId}`);
//             break;
//           }
//       }
//     }
//   },
//   mounted() {
//     this.redirectToHome();
//   },
//   template: `
//     <div class="container">
//       <header class="my-4">
//         <h1 class="text-center">A to Z Household Service</h1>
//       </header>

//       <nav class="navbar navbar-expand-lg navbar-light bg-light">
//         <div class="container-fluid">
//           <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
//             <span class="navbar-toggler-icon"></span>
//           </button>
//           <div class="collapse navbar-collapse" id="navbarNav">
//             <ul class="navbar-nav">
//               <li v-for="(route, index) in routes" :key="index" class="nav-item">
//                 <router-link :to="route.path" class="nav-link" @click="route.name === 'Logout' ? logout() : null">{{ route.name }}</router-link>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </nav>
        
//       <router-view></router-view>

//       <footer class="text-center my-4">
//           <p>&copy; Sagandeep Kaur</p>
//       </footer>
//     </div>
//   `,
// };

import { mapGetters } from 'vuex';

export default {
  name: "Base",
  computed: {
    ...mapGetters(['isAuth', 'userRole', 'userId']),  // Fixed getter names
    routes() {
      if (this.userRole === "Admin" && this.userId) {
        return [
          { name: "Home", path: `/home_admin/${this.userId}` },
          { name: "Search", path: `/search_admin/${this.userId}` },
          { name: "Summary", path: `/summary_admin/${this.userId}` },
          { name: "Logout", action: this.logout },
        ];
      } else if (this.userRole === "Customer" && this.userId) {
        return [
          { name: "Customer Home", path: `/home_customer/${this.userId}` },
          { name: "Search", path: `/search_customer/${this.userId}` },
          { name: "Summary", path: `/summary_customer/${this.userId}` },
          { name: "Logout", action: this.logout },
        ];
      } else if (this.userRole === "Professional" && this.userId) {
        return [
          { name: "Professional Home", path: `/home_professional/${this.userId}` }, // Fixed route
          { name: "Search", path: `/search_professional/${this.userId}` },
          { name: "Summary", path: `/summary_professional/${this.userId}` },
          { name: "Logout", action: this.logout },
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
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
    redirectToHome() {
      if (this.userId && this.userRole && typeof this.userId === "number") {
        const roleRoutes = {
          'Admin': `/home_admin/${this.userId}`,
          'Customer': `/home_customer/${this.userId}`,
          'Professional': `/home_professional/${this.userId}`,  // Fixed path
        };
        this.$router.push(roleRoutes[this.userRole]);
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
                <router-link v-if="route.path" :to="route.path" class="nav-link">{{ route.name }}</router-link>
                <a v-else @click="route.action" class="nav-link" style="cursor:pointer;">{{ route.name }}</a>
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
