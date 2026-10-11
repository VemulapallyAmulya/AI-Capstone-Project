import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:8080/api";

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/books`)
      .then((res) => res.json())
      .then(setBooks)
      .catch(() => setMessage("Start the Spring Boot server first."));
  }, []);

  const categories = ["All", ...new Set(books.map((book) => book.category))];

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const text = `${book.title} ${book.author}`.toLowerCase();
      return (
        text.includes(search.toLowerCase()) &&
        (category === "All" || book.category === category)
      );
    });
  }, [books, search, category]);

  function addToCart(book) {
    setCart((oldCart) => {
      const found = oldCart.find((item) => item.id === book.id);

      if (found) {
        return oldCart.map((item) =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...oldCart, { ...book, quantity: 1 }];
    });

    setMessage(`${book.title} added to cart`);
  }

  function changeQuantity(id, amount) {
    setCart((oldCart) =>
      oldCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      <header>
        <div className="brand">ReadNest</div>

        <div className="search">
          <input
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="cartButton" onClick={() => setShowCart(true)}>
          Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="small">A simple place for your next read</p>
            <h1>Find a book.<br />Start a story.</h1>
            <p>Browse a small collection of books and add your favourites to the cart.</p>
          </div>
        </section>

        <div className="toolbar">
          <h2>Books</h2>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        {message && <p className="message">{message}</p>}

        <section className="grid">
          {filteredBooks.map((book) => (
            <article className="card" key={book.id}>
              <img src={book.cover} alt={book.title} />
              <div className="cardBody">
                <span>{book.category}</span>
                <h3>{book.title}</h3>
                <p>by {book.author}</p>
                <p className="description">{book.description}</p>

                <div className="cardBottom">
                  <strong>₹{book.price}</strong>
                  <button onClick={() => addToCart(book)}>Add</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      {showCart && (
        <div className="overlay">
          <div className="panel">
            <div className="panelHead">
              <h2>Your Cart</h2>
              <button onClick={() => setShowCart(false)}>×</button>
            </div>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cartItem" key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <p>₹{item.price} each</p>
                    </div>

                    <div className="quantity">
                      <button onClick={() => changeQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => changeQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))}

                <h3 className="total">Total: ₹{total.toFixed(2)}</h3>

                <button
                  className="checkout"
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(true);
                  }}
                >
                  Checkout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {showCheckout && (
        <Checkout
          cart={cart}
          total={total}
          onClose={() => setShowCheckout(false)}
          onDone={() => {
            setCart([]);
            setShowCheckout(false);
            setMessage("Order placed successfully.");
          }}
        />
      )}
    </div>
  );
}

function Checkout({ cart, total, onClose, onDone }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  function placeOrder(e) {
    e.preventDefault();

    setLoading(true);

    fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        address,
        items: cart.map((item) => ({
          bookId: item.id,
          quantity: item.quantity
        }))
      })
    })
      .then((res) => res.text())
      .then((orderId) => {
        alert(`Order confirmed: ${orderId}\nAmount: ₹${total.toFixed(2)}`);
        onDone();
      })
      .catch(() => alert("Could not place the order. Check the backend."))
      .finally(() => setLoading(false));
  }

  return (
    <div className="overlay">
      <form className="panel checkoutPanel" onSubmit={placeOrder}>
        <div className="panelHead">
          <h2>Checkout</h2>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <label>Your name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />

        <label>Delivery address</label>
        <textarea
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
        />

        <div className="summary">
          <span>Items</span>
          <strong>₹{total.toFixed(2)}</strong>
        </div>

        <button className="checkout" disabled={loading}>
          {loading ? "Placing..." : "Place Order"}
        </button>

        <p className="note">
          Demo checkout only. No real card or payment details are collected.
        </p>
      </form>
    </div>
  );
}

export default App;
