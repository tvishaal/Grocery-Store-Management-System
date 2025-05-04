export default {
    template: `
    <div>
    <div class="container mt-4">
    <div class="row justify-content-end">
      <div class="col-auto">
        <button @click="downloadResource" class="btn btn-sm btn-primary">Download Products</button>
      </div>
      <div class="col-auto">
        <button @click="managerResource" class="btn btn-sm btn-primary">Download Managers</button>
      </div>
      <div class="col-auto">
        <button @click="customerResource" class="btn btn-sm btn-primary">Download Customers</button>
      </div>
      <div class="col-auto">
        <button @click="orderResource" class="btn btn-sm btn-primary">Download Orders</button>
      </div>
    </div>
  </div>
  
    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    <div class="container mt-4" v-if="allUsers && allUsers.length > 0">
      <h2 class="text-center">List of Managers</h2>
  
      <!-- Active Users Table -->
      <table class="table table-bordered" v-if="activeUsers && activeUsers.length > 0">
        <thead class="thead-light">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Email</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in activeUsers" :key="index">
            <td>{{ user.id }}</td>
            <td>{{ user.email }}</td>
            <td>
              <button @click="deactivateUser(user.id)" class="btn btn-primary btn-sm">Deactivate</button>
              <button @click="deleteUser(user.id)" class="btn btn-danger btn-sm">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- Inactive Users Table -->
      <table class="table table-bordered mt-4" v-if="inactiveUsers && inactiveUsers.length > 0">
        <thead class="thead-light">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Email</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in inactiveUsers" :key="index">
            <td>{{ user.id }}</td>
            <td>{{ user.email }}</td>
            <td>
              <button @click="approveUser(user.id)" class="btn btn-success btn-sm">Approve</button>
              <button @click="deleteUser(user.id)" class="btn btn-danger btn-sm">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  `,
  data() {
    return {
      allUsers: null,
      activeUsers: [],
      inactiveUsers: [],
      token: localStorage.getItem('auth-token'),
      error: null
    };
  },
  watch: {
    allUsers: {
      handler(newVal, oldVal) {
        // This function will be called when allUsers changes
        console.log('allUsers changed:', newVal, oldVal);

        // Update active and inactive users based on the new data
        this.activeUsers = newVal.filter(user => user.active);
        this.inactiveUsers = newVal.filter(user => !user.active);
      },
      deep: true, // Watch for changes deeply in nested objects/arrays
    },
  },
  methods: {

  async customerResource(){
      const res = await fetch('/download-customer-csv',{
        headers: {
          'Authentication-Token': localStorage.getItem('auth-token'),
        },
      })
      const data = await res.json()
      if(res.ok){
        const taskId = data['task_id']
        console.log(taskId)
        const intv = setInterval(async ()=>{
        const csv_res = await fetch(`/get-csv/${taskId}`)
        if (csv_res.ok){
          clearInterval(intv)
          window.location.href = `/get-csv/${taskId}`
        }
      }, 1000)
      }
    },async downloadResource(){
      const res = await fetch('/download-csv',{
        headers: {
          'Authentication-Token': localStorage.getItem('auth-token'),
        },
      })
      const data = await res.json()
      if(res.ok){
        const taskId = data['task_id']
        console.log(taskId)
        const intv = setInterval(async ()=>{
        const csv_res = await fetch(`/get-csv/${taskId}`)
        if (csv_res.ok){
          clearInterval(intv)
          window.location.href = `/get-csv/${taskId}`
        }
      }, 1000)
      }
    },async managerResource(){
      const res = await fetch('/download-manager-csv',{
        headers: {
          'Authentication-Token': localStorage.getItem('auth-token'),
        },
      })
      const data = await res.json()
      if(res.ok){
        const taskId = data['task_id']
        console.log(taskId)
        const intv = setInterval(async ()=>{
        const csv_res = await fetch(`/get-csv/${taskId}`)
        if (csv_res.ok){
          clearInterval(intv)
          window.location.href = `/get-csv/${taskId}`
        }
      }, 1000)
      }
    },async orderResource(){
      alert('asd')
      const res = await fetch('/download-order-csv',{
        headers: {
          'Authentication-Token': localStorage.getItem('auth-token'),
        },
      })
      const data = await res.json()
      if(res.ok){
        const taskId = data['task_id']
        console.log(taskId)
        const intv = setInterval(async ()=>{
        const csv_res = await fetch(`/get-csv/${taskId}`,{
          headers: {
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
        })
        if (csv_res.ok){
          clearInterval(intv)
          window.location.href = `/get-csv/${taskId}`
        }
      }, 1000)
      }
    },
    async deleteUser(manager_id) {
      try {
        const res = await fetch(`/api/users/${manager_id}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': this.token,
          }
        });
  
        const data = await res.json();
  
        if (res.ok) {
          alert(data.message);
          // Remove the user from inactiveUsers
          this.inactiveUsers = this.inactiveUsers.filter(u => u.id !== manager_id);
          this.activeUsers = this.activeUsers.filter(u => u.id !== manager_id);

        } else {
          console.error('Failed to delete user:', data);
        }
      } catch (error) {
        console.error('Error during deletion:', error);
      }
    },
  

    async approveUser(manager_id) {
      try {
        const res = await fetch(`/activate/manager/${manager_id}`, {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
          }
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          // Move the user to activeUsers
          const user = this.inactiveUsers.find(u => u.id === manager_id);
          if (user) {
            user.active = true;
          }
        }
      } catch (error) {
        console.error('Error during approval:', error);
      }
    },
    async deactivateUser(manager_id) {
      try {
        const res = await fetch(`/deactivate/manager/${manager_id}`, {
          method: 'POST',
          headers: {
            'Authentication-Token': this.token,
          }
        });

        const data = await res.json();

        if (res.ok) {
          alert(data.message);
          const user = this.activeUsers.find(u => u.id === manager_id);
          if (user) {
            user.active = false;
          }
        } else {
          console.error('Failed to deactivate user:', data);
        }
      } catch (error) {
        console.error('Error during deactivation:', error);
      }
    },
  },
  async mounted() {
    try {
      const res = await fetch('allmanagers', {
        method: 'GET',
        headers: {
          'Authentication-Token': this.token,
        }
      });

      const data = await res.json();

      if (res.ok) {
        this.allUsers = JSON.parse(JSON.stringify(data));
      } else {
        this.error = data.message;
      }
    } catch (error) {
      console.error('Error during fetch:', error);
      this.error = 'Error during fetch';
    }
  }
};