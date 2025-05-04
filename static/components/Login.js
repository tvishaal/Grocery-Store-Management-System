export default{
    template: `
    <div class="container mt-5">
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-header bg-primary text-white">Login</div>
        <div class="card-body">
          <form @submit.prevent="login">
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="text" v-model="cred.Email" class="form-control" id="email" required>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" v-model="cred.Password" class="form-control" id="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
            <!-- Add a hyperlink to the Create User page -->
            <router-link to="/create-user" class="btn btn-link">Create User</router-link>
          </form>
          <div class="mt-3" style="color: red;">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  

    data() {
      return {
        cred: {
          Email: null,
          Password: null,
        },
        userRole:null,
        error : null
      };
    },
    methods: {
      async login() {
        const res = await fetch('/user-login', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
          body: JSON.stringify(this.cred),
        })
        const data = await res.json()
        if (res.ok) {
          this.userRole=data.role
          localStorage.setItem('auth-token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('user_id', data.user_id);
          localStorage.setItem('name', data.name);
          localStorage.setItem('username', data.username);
          localStorage.setItem('email', data.email);
          localStorage.setItem('phone', data.phone);
          localStorage.setItem('password', data.password); // Make sure to handle securely
          localStorage.setItem('address', data.address);

          this.$router.push({ path:'/home' });
        }
        else{
          this.error = data.message;
        }
      },
    },
  
}
