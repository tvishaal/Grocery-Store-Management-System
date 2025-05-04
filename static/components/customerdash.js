export default{
    template:`
    <div>
    
    <div>
    <div id="app" class="container mt-5">
      <h1 class="text-center mb-4">Welcome</h1>

      <!-- Search Bar for Sections -->
      <div class="mt-4 mb-4">
        <input v-model="sectionSearchTerm" type="text" class="form-control" placeholder="Search">
      </div>

      <div v-for="section in filteredSections" :key="section.id" class="mt-4">
        <div class="mt-4">
          <h2 v-if="section.products.length > 0">{{ section.name }}</h2>
          <table v-if="section.products.length > 0" class="table table-bordered table-striped">
            <thead class="thead-dark">
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Unit Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in section.products" :key="product.id">
                <td>{{ product.name }}</td>
                <td>{{ product.price }}</td>
                <td>{{ product.unit_type }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <input v-if="product.units > 0"
                      v-model="product.quantity"
                      type="number"
                      :min="1"
                      :max="product.units"
                      class="form-control form-control-sm mr-2"
                      placeholder=1
                    >
                    <button
                      v-if="product.units > 0"
                      class="btn btn-primary"
                      @click="addToCart(product)"
                    >
                      Add to Cart
                    </button>
                    <span v-else class="btn btn-secondary disabled">
                      Out of Stock
                    </span>
                  </div>
                  <span v-if="product.quantity > product.units" class="text-danger mt-2">
                    Max quantity is {{ product.units }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
`,

  data() {
    return {
      sections: [],
      productSearchTerm: '',
      sectionSearchTerm: '',
    };
  },
  mounted() {
    // Make a GET request to the API endpoint when the component is mounted
    this.fetchSections();
  },
  methods: {
    async fetchSections() {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/display_sections', {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          this.sections = Object.values(data);
          console.log(data);
        } else {
          console.error('Error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    addToCart(product) {
      if (product.quantity > product.units || product.quantity < 1) {
        alert('Invalid quantity. Please enter a valid quantity.');
        return;
      }
    
      const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      const existingProduct = cartItems.find(item => item.id === product.id);
    
      if (existingProduct) {
        existingProduct.quantity = product.quantity;
      } else {
        cartItems.push({ ...product, quantity: product.quantity || 1 });
      }
    
      localStorage.setItem('cart', JSON.stringify(cartItems));
    
      alert('Product added to the cart:', product);
    },
    
  },computed: {
    // Computed property to filter products based on the search term
    filteredProducts() {
      const term = this.productSearchTerm.toLowerCase();
      return this.sections.reduce((acc, section) => [...acc, ...section.products], [])
        .filter(product =>
          product.name.toLowerCase().includes(term) ||
          product.price.toString().includes(term)
        );
    },
    // Computed property to filter sections based on the search term
    filteredSections() {
      const term = this.sectionSearchTerm.toLowerCase();
      return this.sections.filter(section =>
        section.name.toLowerCase().includes(term) ||
        section.products.some(product =>
          product.name.toLowerCase().includes(term) ||
          product.price.toString().includes(term)
        )
      );
    },
  },
};
