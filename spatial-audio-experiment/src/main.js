import { createApp } from 'vue' // uploading "createApp" function from vue library 
import App from './App.vue'
import './assets/global.css'

// similar to Vue({...}) except the {...} is replaced by a vue component
// App component is then mounted to #app in index.html

const app = createApp(App).mount('#app') 

export default app



