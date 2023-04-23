import { createRouter, createWebHistory } from "vue-router";

// Views Components
import Kanban from '/src/pages/Kanban.vue'
import NotFound from '/src/pages/NotFound.vue'
import HomePage from '/src/pages/HomePage.vue'
import Todo from '/src/pages/TodoPage.vue'



const routes = [
  {
    path: '/',
    name: 'homePage',
    component: HomePage,
  },
  {
    path: '/kanban',
    name: 'kanban',
    component: Kanban,
  },
  {
    path: '/todo',
    name: 'todo',
    component: Todo,
  }, {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: NotFound,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;