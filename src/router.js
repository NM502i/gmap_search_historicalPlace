import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/pages/Home.vue'
import Setting from './components/pages/Setting.vue'

const routes = [
  { path: '/', name: 'Home', component: Home},
  { path: '/setting', name: 'Setting', component: Setting },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router