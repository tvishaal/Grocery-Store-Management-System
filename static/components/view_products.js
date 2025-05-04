export default {
    template: `
    <div>
    <!-- Your component's content goes here -->
  
    <h2 v-if="products && products.length === 0"> NO products exist in the section </h2>
  
    <table class="table">
      <thead>
        <h2 v-id = "!products">No products</h2>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Price</th>
          <th>Unit Type</th>
          <th>Units</th>
          <th>Action</th>

        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.id }}</td>
          <td>{{ product.name }}</td>
          <td>{{ product.price }}</td>
          <td>{{ product.unit_type }}</td>
          <td>{{ product.units }}</td>
          <td v-if="products.length > 0"><button @click="deleteProduct(product.id)" class="btn btn-danger">Delete</button> 
          <router-link :to="{ path: '/edit-product', query: { secId: sectionId, product_id: product.id, name: product.name, price: product.price, unit_type: product.unit_type, units: product.units } }" class="btn btn-primary">Edit</router-link>
          </td>
          </tr>
          
          
      </tbody>
    </table>
  
    <router-link :to="{ path: '/create-product', query: { secId: sectionId } }" class="btn btn-primary">Add Products</router-link>
    <router-link :to="{ path: '/home', query: { secId: sectionId } }" class="btn btn-primary">Back</router-link>

  </div>
    `,
    data() {
      return {
        products: null,
        sectionId:this.$route.query.sectionId
      };
    },
    beforeCreate() {
      // Fetch data before the component is created
      fetch(`/product/${this.$route.query.sectionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('auth-token'),
        },
      }).then(response => response.json())
        .then(data => {
          this.products = data;
          this.sectionId = this.$route.query.sectionId;
        })
        .catch(error => {
          console.error('Error fetching products:', error);
          // Handle the error appropriately
        });
    },
    methods: {
        async deleteProduct(productId) {
          try {
            const response = await fetch(`api/products/${productId}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem('auth-token'),
              },
            });
    
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            // Remove the deleted product from the local products array
            this.products = this.products.filter(product => product.id !== productId);
          } catch (error) {
            console.error('Error deleting product:', error);
          }
        },
        
        async editProduct(productId) {
          try {
            // Assuming the server endpoint is '/api/products/{productId}'
            const response = await fetch(`/api/products/${productId}`, {
              method: 'PUT', // Use the appropriate HTTP method for editing
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem('auth-token'),
              },
             
            });
    
            const data = await response.json();
    
            if (response.ok) {
              alert(data.message);
              this.$router.push({
                path: '/view-products',
                query: { secId: this.product.section_id },
              });
              // Perform any additional actions after a successful edit
            } else {
              console.error('Failed to edit product:', data);
            }
          } catch (error) {
            console.error('Error editing product:', error);
          }
        },
      },
    };

  