export default{
    template:`  
  <div>
    <h2 class="mt-4 mb-3">Your Orders</h2>
    <div class="row">
      <div v-for="cart in carts" :key="cart.cart_id" class="col-md-4 mb-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Cart ID: {{ cart.cart_id }}</h5>
            <ul class="list-group list-group-flush">
              <li v-for="item in cart.items" :key="item.item_productId" class="list-group-item d-flex justify-content-between align-items-center">
                <span class="item-name">{{ item.name }}</span>
                Qty: {{ item.quantity }} - {{ item.price }}
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="font-weight-bold">Total:</span>
                {{ calculateTotal(cart.items) }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
    `,
      data() {
        return {
          carts: [],
        };
      },
      mounted() {
        // Fetch cart items from the API endpoint
        this.fetchCartItems();
      },
      methods: {
        async fetchCartItems() {
          try {
            const userId = localStorage.getItem('user_id');
            const response = await fetch(`/api/get_cart_items/${userId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token': localStorage.getItem('auth-token'),
              },
            });
    
            if (response.ok) {
              this.carts = await response.json();
            } else {
              console.error('Error fetching cart items:', response.statusText);
            }
          } catch (error) {
            console.error('Error fetching cart items:', error);
          }
        },
        calculateTotal(items) {
          return items.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2);
        },
      },
    };