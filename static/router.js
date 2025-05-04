import Home from './components/Home.js'
import Login from './components/Login.js'
import createUser from './components/createUser.js'
import useractivate from './components/useractivate.js'
import create_section from './components/create_section.js'
import approve_section from './components/approve_section.js'
import admindash from './components/admindash.js'
import create_product from './components/create_product.js'
import managerdash from './components/managerdash.js'
import view_products from './components/view_products.js'
import edit_product from './components/edit_product.js'
import update_user from './components/update_user.js'
import cart from './components/cart.js'
import my_orders from './components/my_orders.js'
const routes = [
    {path:'/', component:Login, name: 'Login'},
    {path:'/home', component:Home, name:'Home'},
    {path:'/create-user', component:createUser, name:'CreateUser'},
    {path:'/user-activate', component:useractivate,},
    {path:'/create-section', component:create_section,},
    {path:'/approve-section', component:approve_section},
    {path:'/admin-dash', component:admindash},
    {path:'/create-product', component:create_product},
    {path:'/manager-dash', component:managerdash},
    {path:'/view-products', component: view_products},
    {path:'/edit-product', component:edit_product},
    {path:'/update-user', component:update_user},
    {path:'/cart', component:cart},
    {path:'/my-order', component:my_orders}
]  
export default new VueRouter({
    routes,
})