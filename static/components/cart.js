export default {
    template: `
    
  <div  class="container mt-5 d-flex justify-content-center">
  <div>
    <h2>Your Cart</h2>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col">Quantity</th>
          <th scope="col">Price</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in cartItems" :key="item.id">
          <td>{{ item.name }}</td>
          <td>
            <input v-model="item.quantity" type="number" :min="1" :max="item.units" class="form-control form-control-sm" @change="updateCartItemQuantity(item)">
          </td>
          <td>{{ item.price }}</td>
          <td>
            <button @click="removeFromCart(item)" class="btn btn-danger btn-sm">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p class="mt-3">Total: {{ formattedTotal }}</p>
    <button v-if="cartItems.length > 0" @click="placeOrder" class="btn btn-primary mt-3">Place Order</button>  </div>
</div>
  
  `,
    data() {
        return {
          cartItems: [],
          formattedTotal: 0,
        };
      },
      created() {
        // Fetch cart items from local storage
        this.cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
        // Convert quantity to a number for calculations
        this.cartItems.forEach(item => {
          item.quantity = parseInt(item.quantity);
        });
    
        // Calculate total once data is fetched
        this.calculateTotal();
      },
      methods: {
        async placeOrder() {
          try {
            // Get user_id from local storage (replace with your method of obtaining user_id)
            const user_id = localStorage.getItem('user_id');
            if (!user_id) {
              alert('User ID not found. Please log in.');
              return;
            }
    
            // Prepare the request body
            const orderRequest = {
              user_id: parseInt(user_id), // Convert user_id to a number
              products: this.cartItems.map(item => ({
                name: item.name,
                item_productId: item.id,
                price: item.price,
                quantity: item.quantity,
              })),
            };
    
            // Send the order request to the server
            const response = await fetch('/api/place_order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem('auth-token'),
              },
              body: JSON.stringify(orderRequest),
            });
    
            if (response.ok) {
              const data = await response.json();
              const orderId = data.cart_id;
    
              // Reset the cart after placing the order
              this.cartItems = [];
              localStorage.setItem('cart', JSON.stringify(this.cartItems));
    
              // Store the order ID in local storage
              localStorage.setItem('orderId', orderId);
    
              // Recalculate total after clearing cart
              this.calculateTotal();
              
              alert('Order placed successfully! Order ID: ' + orderId);
            } else {
              console.error('Failed to place order:', response.statusText);
            }
          } catch (error) {
            console.error('Error placing order:', error);
          }
        },removeFromCart(item) {
          // Remove item from cart
          this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
          // Update local storage
          localStorage.setItem('cart', JSON.stringify(this.cartItems));
          // Recalculate total
          this.calculateTotal();
        },
    
        updateCartItemQuantity(item) {
          // Ensure the quantity is within the valid range
          item.quantity = Math.max(1, Math.min(item.quantity, item.units));
          // Update local storage
          localStorage.setItem('cart', JSON.stringify(this.cartItems));
          // Recalculate total
          this.calculateTotal();
        },
    
        calculateTotal() {
          this.formattedTotal = this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
        },
      },
    };