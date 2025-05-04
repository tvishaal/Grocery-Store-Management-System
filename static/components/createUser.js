export default{

    template:  `  <div>
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h2 class="text-center mb-4">Please enter details</h2>
              <form @submit.prevent="createUser">
                <div class="form-group">
                  <label for="username">Username:</label>
                  <input v-model="user.username" type="text" class="form-control" id="username" name="username" required>
                </div>

                <div class="form-group">
                  <label for="password">Password:</label>
                  <input v-model="user.password" type="password" class="form-control" id="password" name="password" required>
                </div>

                <div class="form-group">
                  <label for="name">Name:</label>
                  <input v-model="user.name" type="text" class="form-control" id="name" name="name" required>
                </div>

                <div class="form-group">
                  <label for="phone">Phone:</label>
                  <input v-model="user.phone" type="number" class="form-control" id="phone" name="phone" required>
                </div>

                <div class="form-group">
                  <label for="email">Email Id:</label>
                  <input v-model="user.email" type="text" class="form-control" id="email" name="email" required>
                </div>

                <div class="form-group">
                  <label for="address">Address:</label>
                  <input v-model="user.address" type="text" class="form-control" id="address" name="address" required>
                </div>

                <div class="form-group mb-3">
                  <label for="role">Select Role:</label>
                  <div class="form-check form-check-inline">
                    <input v-model="user.role" type="radio" id="manager" name="role" value="manager" class="form-check-input">
                    <label class="form-check-label" for="manager">Manager</label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input v-model="user.role" type="radio" id="customer" name="role" value="customer" class="form-check-input">
                    <label class="form-check-label" for="customer">Customer</label>
                  </div>
                </div>

                <div class="text-center">
                  <button type="submit" class="btn btn-primary">Create User</button>
                  <router-link to="/" class="btn btn-secondary">Back</router-link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,


  data() {
    return {
      user: {
        username: '',
        password: '',
        name: '',
        phone: '',
        email: '',
        address: '',
        role:'',
      },
    };
  },
  methods: {
    async createUser() {
      try {
        const requestData = {
        username: this.user.username,
        password: this.user.password,
        name: this.user.name,
        phone: this.user.phone,
        email: this.user.email,
        address: this.user.address,
        role:this.user.role,
        };
    
        const response = await fetch('/create/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
          body: JSON.stringify(requestData),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          alert('User created successfully');
        }
        else{
        alert(data.message)};
      } catch (error) {
        alert( error.message);
      }
    },
    },
}

