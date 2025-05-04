export default{
    template:`<nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
    <a class="navbar-brand" href="#" style="font-size: 32px;">Vishaal Mega Mart</a> <!-- Increased font size -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">

        <li class="nav-item" v-if="role === 'customer'">
        <router-link to="/home" class="nav-link">Home</router-link>
        </li>       
          <li class="nav-item" v-if="role === 'admin'">
          <router-link to="/approve-section" class="nav-link">Section Approval</router-link>
          </li>
          <li class="nav-item" v-if="role === 'admin'">
          <router-link to="/admin-dash" class="nav-link">Manager Approval</router-link>
          </li>
          <li class="nav-item" v-if="role === 'admin' || role === 'manager'">
          <router-link to="/create-section" class="nav-link">Add Section</router-link>
          </li>
          <li class="nav-item" v-if="role === 'manager'">
          <router-link to="/manager-dash" class="nav-link">Home</router-link>
          </li>
          <li class="nav-item" v-if="role === 'customer'">
          <router-link to="/cart" class="nav-link">Cart</router-link>
          </li>
          <li class="nav-item" v-if="role === 'customer'">
          <router-link to="/my-order" class="nav-link">My Orders</router-link>
          </li>
          <li class="nav-item" v-if= "is_login">
          <router-link to="/update-user" class="nav-link">Update User</router-link>
          </li>
          <li class="nav-item" v-if= "is_login">
          <a class="nav-link" @click = 'logout' >Logout</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>`,
  data() {
    return {
      role: localStorage.getItem('role'),
    };
  },
  methods: {
    logout() {
      fetch(`/logout`, {  
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('auth-token'),
        },
      }).then((res) => {
        if(res.status ==200){
        localStorage.removeItem('auth-token');
        localStorage.removeItem('role');
        this.$router.push('/');
        }
      });
    },
  },
  beforeCreate() {
    // Set is_login based on localStorage
    this.is_login = localStorage.getItem('auth-token');
  },
}