export default{
    template:`<div class="container mt-4">
    <div class="card text-center mx-auto" style="max-width: 400px;">
      <div class="card-body">
        <h2 class="card-title mb-4">Create Section</h2>
  
        <form @submit.prevent="createSection" class="text-left">
  
          <div class="form-group">
            <label for="sectionName">Section Name:</label>
            <input v-model="sectionName" type="text" class="form-control" id="sectionName" name="sectionName" required>
          </div>
  
          <div class="text-center">
            <button type="submit" class="btn btn-primary">Create Section</button>
          </div>
  
        </form>
  
      </div>
    </div>
  </div>
  
  `,
    data() {
      return {
        sectionName: '',
        user_id: localStorage.getItem('user_id'),
      };
    },
    methods: {
      async createSection() {
        try {
          const apiUrl = '/create-section';
          const requestData = {
            name: this.sectionName,
            creator_id: this.user_id,
          };
      
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token'),
            },
            body: JSON.stringify(requestData),
          });
      
          const data = await response.json();
      
          if (response.ok) {
            alert('Section created successfully')
            this.$router.push({ name: 'Home' });;
          }
          else{
            alert(data.message);
          }
        } catch (error) {
          console.error('Error creating section:', error);
        }
      },
      },
    }
  