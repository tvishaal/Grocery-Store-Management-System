export default{

    template:`
    <template>
  <div>
    <h1>Product List</h1>
    <ul>
      <li v-for="(section, index) in sections" :key="index">
        <h2>{{ section.name }}</h2>
        <ul>
          <li v-for="(product, key) in section.products" :key="key">
            {{ product }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
`,
  data() {
    return {
      sections: [],
    };
  },
  mounted() {
    // Make API request to DisplaySectionsResource endpoint
    this.fetchSections();
  },
  methods: {
    async fetchSections() {
      try {
        // Assuming you have Axios installed
        const response = await fetch('/api/display_sections', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
        });
                this.sections = response.data;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
  },
};
