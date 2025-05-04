export default {
    template: `
    <div>
    <h2>List of Managers</h2>
    <ul>
      <li v-for="user in allUsers" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
    `,
    data() {
      return {
        allUsers: null,
        token: localStorage.getItem('auth-token')
      };
    },
    async mounted() {
      try {
        const res = await fetch('allmanagers', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token,  // Use 'this.token' to access the data property
          }
        });
  
        const data = await res.json();
  
        if (res.ok) {
          this.allUsers = data;
        } else {
          console.error('Failed to fetch data:', data);
        }
      } catch (error) {
        console.error('Error during fetch:', error);
      }
    }
  };