const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// cart state
let cart = [];
let btnsDOM = [];

// getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return {
          title,
          price,
          id,
          image
        };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = '';
    products.forEach(product => {
      result += `
          <article class="product">
          <div class="img-container">
            <img src="${product.image}"
                alt="product"
                class="product-img" />
            <button class="bag-btn"
                    data-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
      `;
    });
    productsDOM.innerHTML = result;
  }

  getBagBtns() {
    const btns = [...document.querySelectorAll('.bag-btn')];
    btnsDOM = btns;
    btns.forEach(btn => {
      let id = btn.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        btn.innerText = 'In Cart';
        btn.disabled = true;
      } else {
        btn.addEventListener('click', e => {
          e.target.innerText = 'In Cart';
          e.target.disabled = true;
          // get product
          let cartItem = {
            ...Storage.getProduct(id),
            amount: 1
          };
          // add item to cart
          cart = [...cart, cartItem];

          // save cart in ls
          Storage.saveCart(cart);

          // set cart values
          this.setCartValues(cart);

          // display cart item
          this.addCartItem(cartItem);

          // showing cart
          this.showCart();
        });
      }
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerHTML = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
			<img src="${item.image}"
			alt="product" />
			<div>
				<h4>${item.title}</h4>
				<h5>$${item.price}</h5>
				<span class="remove-item" data-id="${item.id}">remove</span>
			</div>
			<div>
				<i class="fas fa-chevron-up" data-id="${item.id}"></i>
				<p class="item-amount">${item.amount}</p>
				<i class="fas fa-chevron-down" data-id="${item.id}"></i>
			</div>
		`;
    cartContent.appendChild(div);
  }

  showCart() {
    cartDOM.classList.add('showCart');
    cartOverlay.classList.add('transparentBcg');
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  hideCart() {
    cartDOM.classList.remove('showCart');
    cartOverlay.classList.remove('transparentBcg');
  }

  cartLogic() {
    clearCartBtn.addEventListener('click', () => this.clearCart());
    cartContent.addEventListener('click', e => {
      if (e.target.classList.contains('remove-item')) {
        let removeItem = e.target;
        let id = removeItem.dataset.id;

        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (e.target.classList.contains('fa-chevron-up')) {
        let addAmount = e.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount++;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (e.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = e.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount--;
        if (tempItem.amount) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleBtn(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleBtn(id) {
    return btnsDOM.find(item => item.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(item => item.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupApp();
  // get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(_ => {
      ui.getBagBtns();
      ui.cartLogic();
    });
});
