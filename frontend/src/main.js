import { createApp } from 'vue';
import Base from './components/Base.js'; // Import Base.js
import router from './router/index.js'; // Router
import store from './router/store.js'; // Vuex Store
import './assets/global.css'

const app = createApp(Base); // Use Base.js as the root component
app.use(router); // Use Vue Router
app.use(store); // Use Vuex Store
app.mount('#app'); // Mount to the div with id="app"
