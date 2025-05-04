export default{
    template:`   <div class="container mt-4">
    <h2>Edit Product</h2>

    <!-- Product Form -->
    <form @submit.prevent="editProduct">
      <div class="mb-3">
        <label for="productName" class="form-label">Product Name</label>
        <input v-model="product.name" type="text" class="form-control" id="productName" required>
      </div>

      <div class="mb-3">
        <label for="productPrice" class="form-label">Price</label>
        <input v-model="product.price" type="number" class="form-control" id="productPrice" required>
      </div>

      <div class="mb-3">
        <label for="productUnits" class="form-label">Units</label>
        <input v-model="product.units" type="number" class="form-control" id="productUnits" required>
      </div>

      <div class="mb-3">
        <label for="productUnitType" class="form-label">Unit Type</label>
        <input v-model="product.unit_type" type="text" class="form-control" id="productUnitType" required>
      </div>

      <button type="submit" class="btn btn-primary">Edit Product</button>
    </form>
  </div>`,
  data() {
    return {
      product: {
        name: null,
        section_id: null, // Initialize section_id to null
        price: null,
        units: null,
        unit_type: null
      },
    };
  },
  created() {
    // Fetch values from route query parameters and set them to the data properties
    this.product.name = this.$route.query.name || null;
    this.product.price = this.$route.query.price || null;
    this.product.units = this.$route.query.units || null;
    this.product.unit_type = this.$route.query.unit_type || null;
    this.product.section_id = this.$route.query.secId || null; // Set section_id from query parameter
  },
  methods: {
    async editProduct() {
      try {
        const productId = this.$route.query.product_id; // Assuming you pass the product ID from the route

        const response = await fetch(`/api/products/${productId}`, {
          method: 'PUT', // Assuming you use the HTTP PUT method for editing
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
          body: JSON.stringify(this.product),
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message)
          this.$router.push({
            path: '/view-products',
            query: { sectionId: this.product.section_id },
          });;
        } else {
          console.error('Failed to edit product:', data.error);
        }
      } catch (error) {
        console.error('Error editing product:', error);
      }
    },
  },
};
