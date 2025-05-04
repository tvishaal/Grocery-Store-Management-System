import router from './router.js'
import Navigationbar from './components/Navigationbar.js'


router.beforeEach((to, from, next) => {
    if (to.name !== 'Login' && !localStorage.getItem('auth-token')) {
      if (to.name === 'CreateUser') {
        next();
      } else {
        next({ name: 'Login' });
      }
    } else {
      next();
    }
  });
new Vue({
    el: '#app',
    template: `<div>
    <Navigationbar :key='has_changed' />
    <router-view class = "m-3"/></div>`,
    router,
    components:{
        Navigationbar,
    },
    data:{
        has_changed: true,
    },
    watch: {
        $route(to,from){
    this.has_changed = !this.has_changed
        }
    }
})
