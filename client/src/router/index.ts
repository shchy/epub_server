import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SeriesView from '../views/SeriesView.vue'
import BookView from '../views/BookView.vue'

export const routeNames = {
  Home: 'HOME',
  Series: 'SERIES',
  Book: 'BOOK'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: routeNames.Home,
      component: HomeView
    },
    {
      path: '/series/:id',
      name: routeNames.Series,
      component: SeriesView
    },
    {
      path: '/book/:id',
      name: routeNames.Book,
      component: BookView
    }
  ]
})

export default router
