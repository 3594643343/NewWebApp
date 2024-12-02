import { ref } from 'vue'


// export const useCounterStore = defineStore('counter', () => {
//   const count = ref(0)
//   const doubleCount = computed(() => count.value * 2)
//   function increment() {
//     count.value++
//   }

//   return { count, doubleCount, increment }
// })

// export const useTokenStore = defineStore('token', () => {
//   const token = ref('')
//   const setToken = (newToken) => {
//     token.value = newToken
//   }
//   const removeToken = () => {
//     token.value = ''
//   }
//   return { 
//     token, setToken, removeToken
//    }
// }, {
//   persist: true
// })
import { defineStore } from 'pinia';

export const useRouteStore = defineStore('route',() => {
  const currentRoute = ref('');
  const setCurrentRoute = (newRoute) => {
    currentRoute.value = newRoute;
  }
  return {
    currentRoute, setCurrentRoute
  }
});



