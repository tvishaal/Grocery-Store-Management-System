export default{
    template:`   <div class="container mt-4">
    <div>
      <h2 class="text-center">All Sections</h2>

      <!-- Approved Sections -->
      <div v-if="approvedSections.length > 0">
        <h2 class="text-center">Approved Sections</h2>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="section in approvedSections" :key="section.id">
              <td>{{ section.id }}</td>
              <td>{{ section.name }}</td>
              <td>
                <router-link :to="{ path:'/view-products', query: { sectionId: section.id } }" class="btn btn-primary">Edit Products</router-link>
                <button @click="sectionProductResource(section)" class="btn btn-sm btn-primary">Export Products</button>
                </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Unapproved Sections -->
      <div v-if="unapprovedSections.length > 0">
        <h2 class="text-center">Unapproved Sections</h2>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="section in unapprovedSections" :key="section.id">
              <td>{{ section.id }}</td>
              <td>{{ section.name }}</td>
              <td v-if="section.is_approved === false">Unapproved</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Show a message if no sections are present -->
      <div v-if="approvedSections.length === 0 && unapprovedSections.length === 0" class="text-center">
        <p>No sections available.</p>
      </div>
    </div>
  </div>`,
  data() {
    return {
      approvedSections: [],
      unapprovedSections: [],
    };
  },
  async created() {
    try {
      // Fetch all sections
      const responseAll = await fetch('/all_sections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('auth-token'),
        },
      });      
      if (responseAll.ok) {
        const dataAll = await responseAll.json();
        // Set all sections in the approvedSections
        this.approvedSections = dataAll;
      } else {
        alert('Please try again later');
      }

      // Fetch only approved sections
      const responseApproved = await fetch('/approved_sections', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('auth-token'),
        },
      });
      
      if (responseApproved.ok) {
        const dataApproved = await responseApproved.json();
        // Set only approved sections in the approvedSections
        this.approvedSections = dataApproved;
      } else {
        alert('Please try again later');
      }

      // Fetch all unapproved sections
      const responseUnapproved = await fetch(`/allsection/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('auth-token'),
        },
      });
            if (responseUnapproved.ok) {
        const dataUnapproved = await responseUnapproved.json();
        // Set all unapproved sections in the unapprovedSections
        this.unapprovedSections = dataUnapproved.filter(section => !section.is_approved);
      } else {
        alert('Please try again later');
      }
    } catch (error) {
      console.error('Error fetching sections:', error.message);
    }
  },methods:{
    async sectionProductResource(section){
      const downloadUrl = `/download-section-csv/${section.id}`
      const res = await fetch(downloadUrl)
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
    },
  }
};