export default{
    template:`  <div class="container mt-4">
    <h2>Add Product to Section</h2>

    <!-- Product Form -->
    <form @submit.prevent="addProduct">
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

      <button type="submit" class="btn btn-primary">Add Product</button>
      
    </form>
  </div>`,
  data() {
    return {
      product: {
        name: null,
        section_id: this.$route.query.secId,
        price: null,
        units: null,
        unit_type: null
      },
    };
  },
  methods: {
    async addProduct() {
      try {
        const secId = this.$route.query.secId;
        const response = await fetch(`/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token'),
          },
          body: JSON.stringify(this.product),
        });
    
        const responseData = await response.json();
    
        if (response.ok) {
          // Clear form fields or perform other actions
          this.product = {}; // Assuming 'product' is a reactive property in your data
    
          // Provide feedback to the user
          alert('Product added successfully!');
        } else {
          // Provide more user-friendly error messages or handle errors appropriately
          alert(responseData.message);
        }
      } catch (error) {
        console.error('Error adding product:', error);
        // Handle the error appropriately, e.g., show an error message to the user
        alert('An unexpected error occurred while adding the product.');
      }
    },
  },
}