export default {
    template: `
    <div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div class="container mt-4">
      <h2 class="text-center">Inactive Sections</h2>
  
      <!-- Inactive Sections Table -->
      <table v-if="allSections && allSections.length > 0" class="table table-bordered mt-4">
        <thead class="thead-light">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Section Name</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(section, index) in inactiveSections" :key="index">
            <td>{{ section.id }}</td>
            <td>{{ section.name }}</td>
            <td>
              <button @click="approveSection(section.id)" class="btn btn-success btn-sm">Activate</button>
              <button @click="deleteSection(section.id)" class="btn btn-danger btn-sm">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <h2 class="text-center mt-4">Active Sections</h2>
  
      <!-- Active Sections Table -->
      <table v-if="allSections && allSections.length > 0" class="table table-bordered">
        <thead class="thead-light">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Section Name</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(section, index) in activeSections" :key="index">
            <td>{{ section.id }}</td>
            <td>{{ section.name }}</td>
            <td>
              <button @click="deactivateSection(section.id)" class="btn btn-primary btn-sm">Deactivate</button>
              <button @click="deleteSection(section.id)" class="btn btn-danger btn-sm">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  
    `,
    data() {
      return {
        allSections: null,
        activeSections: [],
        inactiveSections: [],
        newSectionName: '', 
        token: localStorage.getItem('auth-token'),
        error: null,
      };
    },
    watch: {
      allSections: {
        handler(newVal, oldVal) {
          
          console.log('allSections changed:', newVal, oldVal);
  
  
          this.activeSections = newVal.filter(section => section.is_approved === true);
          this.inactiveSections = newVal.filter(section => section.is_approved === false);
        },
        deep: true, 
      },
    },
    methods: {
      async approveSection(section_id) {
        try {
          const res = await fetch(`/approve/section/${section_id}`, {
            method: 'POST',
            headers: {
              'Authentication-Token': this.token,
            }
          });
          const data = await res.json();
          if (res.ok) {
            alert(data.message);
            

            const section = this.inactiveSections.find(s => s.id === section_id);
            if (section) {
              section.is_approved = true;
            }
          }
        } catch (error) {
          console.error('Error during section approval:', error);
        }
      },
      async deactivateSection(section_id) {
        try {
          const res = await fetch(`/deactivate/section/${section_id}`, {
            method: 'POST',
            headers: {
              'Authentication-Token': this.token,
            }
          });
    
          const data = await res.json();
    
          if (res.ok) {
            alert(data.message);
    

            const section = this.activeSections.find(s => s.id === section_id);
            if (section) {
              section.is_approved = false;
            }
          } else {
            console.error('Failed to deactivate section:', data);
          }
        } catch (error) {
          console.error('Error during section deactivation:', error);
        }
      },
      async deleteSection(section_id) {
        try {
          const res = await fetch(`api/sections/${section_id}`, {
            method: 'DELETE', 
            headers: {
              'Authentication-Token': this.token,
            },
          });
  
          const data = await res.json();
  
          if (res.ok) {
            alert(data.message);

            this.allSections = this.allSections.filter(s => s.id !== section_id);
          } else {
            console.error('Failed to delete section:', data);
          }
        } catch (error) {
          console.error('Error during section deletion:', error);
        }
  },

    },
    computed: {
      activeSections() {
        return this.allSections.filter(section => section.is_approved === true);
      },
      inactiveSections() {
        return this.allSections.filter(section => section.is_approved === false);
      }
    },
    async mounted() {
      try {
        const res = await fetch('/all_sections', {
          method: 'GET',
          headers: {
            'Authentication-Token': this.token,
          }
        });
  
        const data = await res.json();
  
        if (res.ok) {
          this.allSections = JSON.parse(JSON.stringify(data));
        } else {
          this.error = 'Failed to fetch sections';
        }
      } catch (error) {
        console.error('Error during fetch of sections:', error);
        this.error = 'Error during fetch of sections';
      }
    },
  };
  
