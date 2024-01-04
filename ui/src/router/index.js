import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PortalView from '../views/PortalView.vue'
import AddSeries from '@/components/AddSeries.vue'
import AddEpisode from '@/components/AddEpisode.vue'
import Episodes from '@/components/Episodes.vue'
import Config from '@/components/Config.vue'
import Series from '@/components/Series.vue'
import SearchView from '@/views/SearchView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/portal',
      name: 'portal',
      redirect: '/portal/series',
      component: PortalView,
      children: [
        {
          path: 'add-series',
          name: 'AddSeries',
          component: AddSeries
        },
        {
          path: 'add-episode',
          name: 'AddEpisode',
          component: AddEpisode
        },
        {
          path: 'episodes',
          name: 'Episodes',
          component: Episodes
        },
        {
          path: 'series',
          name: 'Series',
          component: Series
        },
        {
          path: 'config',
          name: 'Config',
          component: Config
        }
      ]
    }

  ]
})

export default router
