export default{
    template:`<div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h2 class="card-title text-center mb-4">Edit User</h2>
            <form @submit.prevent="updateUser">
  
              <div class="form-group">
                <label for="name">Name:</label>
                <input v-model="userData.name" type="text" class="form-control" id="name" required>
              </div>
  
              <div class="form-group">
                <label for="username">Username:</label>
                <input v-model="userData.username" type="text" class="form-control" id="username" required>
              </div>
  
              <!-- Omitting the 'email' field -->
  
              <div class="form-group">
                <label for="phone">Phone:</label>
                <input v-model="userData.phone" type="number" class="form-control" id="phone" required>
              </div>
  
              <div class="form-group">
                <label for="password">Password:</label>
                <input v-model="userData.password" type="password" class="form-control" id="password" required>
              </div>
  
              <div class="form-group">
                <label for="address">Address:</label>
                <input v-model="userData.address" type="text" class="form-control" id="address" required>
              </div>
  
              <div class="text-center mt-4">
                <button type="submit" class="btn btn-primary btn-block">Update User</button>
              </div>
  
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      userData: {
        name: '',
        username: '',
        phone: '',
        password: '',
        address: '',
      },
    };
  },
  mounted() {
    this.fetchUserData();
  },
  methods: {
    fetchUserData() {
      this.userData.name = localStorage.getItem('name') || '';
      this.userData.username = localStorage.getItem('username') || '';
      this.userData.phone = localStorage.getItem('phone') || '';
      this.userData.address = localStorage.getItem('address') || '';
    },
    async updateUser() {
      try {
        const response = await fetch(`/api/users/${localStorage.getItem('user_id')}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
          body: JSON.stringify(this.userData),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('name', this.userData.name);
          localStorage.setItem('username', this.userData.username);
          localStorage.setItem('phone', this.userData.phone);
          localStorage.setItem('address', this.userData.address);
          alert(data.message)
          this.$router.push('/home');
          
        } else {
          alert('Error updating user:', data.error);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    },
  },
};