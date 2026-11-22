import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Check, ChevronDown, Heart, Menu, Minus, Plus, Search, ShoppingBag, Star, X } from "lucide-react";

const categories = ["All", "Sneakers", "Apparel", "Accessories"];
const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_FEE = 299;
const money = (amount) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
}).format(Number(amount));

const DEMO_PRODUCTS = [
  { _id: "velocity-low", name: "Velocity Low 'Volt'", category: "Sneakers", price: 8499, compareAtPrice: 9999, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", rating: 4.9, reviewCount: 186, stock: 18, badge: "Drop", featured: true },
  { _id: "cloud-91", name: "Cloud Runner 91", category: "Sneakers", price: 6899, compareAtPrice: 7499, image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85", rating: 4.8, reviewCount: 94, stock: 12, badge: "Best seller", featured: true },
  { _id: "courtside-jacket", name: "Courtside Track Jacket", category: "Apparel", price: 4799, compareAtPrice: 5999, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85", rating: 4.7, reviewCount: 58, stock: 21, badge: "New", featured: true },
  { _id: "parallel-cap", name: "Parallel Five-Panel Cap", category: "Accessories", price: 1699, compareAtPrice: 2199, image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=85", rating: 4.8, reviewCount: 73, stock: 30, badge: "", featured: true },
  { _id: "afterdark-high", name: "Afterdark High", category: "Sneakers", price: 9299, compareAtPrice: 10999, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85", rating: 4.9, reviewCount: 143, stock: 9, badge: "Limited", featured: true },
  { _id: "studio-overshirt", name: "Studio Utility Overshirt", category: "Apparel", price: 5299, compareAtPrice: 6499, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=900&q=85", rating: 4.6, reviewCount: 42, stock: 16, badge: "Exclusive", featured: true },
  { _id: "block-crew", name: "Block Graphic Crew", category: "Apparel", price: 2999, compareAtPrice: 3499, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", rating: 4.8, reviewCount: 121, stock: 24, badge: "", featured: true },
  { _id: "metro-sling", name: "Metro Crossbody Sling", category: "Accessories", price: 2499, compareAtPrice: 2999, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85", rating: 4.7, reviewCount: 67, stock: 20, badge: "Restocked", featured: true }
];

function App() {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("kickroom-cart") || "[]"));
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => localStorage.setItem("kickroom-cart", JSON.stringify(cart)), [cart]);

  const products = useMemo(() => {
    const query = search.trim().toLowerCase();
    return DEMO_PRODUCTS
      .filter((product) => (category === "All" || product.category === category) && (!query || product.name.toLowerCase().includes(query)))
      .sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0);
  }, [category, search, sort]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const addToCart = (product) => {
    setCart((items) => {
      const current = items.find((item) => item._id === product._id);
      if (current && current.quantity >= product.stock) {
        setNotice("Maximum available quantity reached.");
        return items;
      }
      return current
        ? items.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added to your bag.`);
    setCartOpen(true);
  };

  const updateQuantity = (id, amount) => setCart((items) =>
    items.map((item) => item._id === id ? { ...item, quantity: Math.min(item.stock, item.quantity + amount) } : item).filter((item) => item.quantity > 0)
  );

  return (
    <>
      <div className="announcement"><span>WEEKLY EDIT 024</span><span className="announcement-rule" /> Free shipping over {money(FREE_SHIPPING_THRESHOLD)}</div>
      <header className="site-header">
        <button className="mobile-menu icon-button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Menu size={22} /></button>
        <a className="wordmark" href="#" aria-label="Kickroom home">KICK<span>ROOM</span></a>
        <nav className={`main-nav ${menuOpen ? "mobile-open" : ""}`} aria-label="Main navigation">
          <a href="#shop" onClick={() => setMenuOpen(false)}>The edit</a>
          <a href="#shop" onClick={() => { setCategory("Sneakers"); setMenuOpen(false); }}>Sneakers</a>
          <a href="#shop" onClick={() => { setCategory("Apparel"); setMenuOpen(false); }}>Apparel</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Our story</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-toggle" aria-label="Focus product search" onClick={() => document.getElementById("product-search")?.focus()}><Search size={20} /></button>
          <button className="account-button" onClick={() => setNotice("Account sign-in is available in the full-store demo.")}>Account</button>
          <button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Open bag, ${cartCount} items`}><ShoppingBag size={19} /><b>{cartCount}</b></button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span /> WEEKLY EDIT / ISSUE 024</p>
            <h1>MOVE<br /><em>YOUR WAY.</em></h1>
            <p className="hero-description">A considered collection of limited sneakers, everyday layers and carry essentials for wherever the week takes you.</p>
            <a className="button button-dark" href="#shop">Shop the drop <ArrowRight size={17} /></a>
          </div>
          <div className="hero-art" role="img" aria-label="Red sneaker on a blue background">
            <span className="hero-index">24</span>
            <span className="hero-label">LIMITED / 200 PAIRS</span>
            <span className="hero-price">FROM {money(8499)}</span>
          </div>
          <a className="scroll-cue" href="#shop"><ArrowDown size={15} /> Explore drop</a>
        </section>

        <div className="ticker" aria-label="Store benefits"><span>AUTHENTIC ONLY</span><i>✦</i><span>48H DISPATCH</span><i>✦</i><span>FREE SHIPPING {money(FREE_SHIPPING_THRESHOLD)}+</span><i>✦</i><span>CURATED WEEKLY</span></div>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div><p className="eyebrow"><span /> CURRENT ROTATION</p><h2>Fresh on<br /><em>the floor.</em></h2></div>
            <p>Low stock. Loud choices. Every piece in this edit is selected for the streets, not the shelves.</p>
          </div>
          <div className="shop-toolbar">
            <div className="category-list" role="group" aria-label="Filter by category">
              {categories.map((item) => <button key={item} className={`category-button ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
            <div className="shop-controls">
              <label className="search-field"><Search size={16} /><input id="product-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the rotation" aria-label="Search products" />{search && <button aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}</label>
              <label className="sort-select"><span>Sort:</span><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select><ChevronDown size={14} /></label>
            </div>
          </div>

          {products.length ? <div className="product-grid">
            {products.map((product, index) => <article className="product-card" key={product._id} style={{ "--card-index": index }}>
              <div className="product-image-wrap">
                <img src={product.image} alt={product.name} loading="lazy" />
                <button className="favorite-button" aria-label={`Save ${product.name}`} onClick={() => setNotice("Saved to your wishlist.")}><Heart size={17} /></button>
                {product.badge && <span className="product-badge">{product.badge}</span>}
                <button className="quick-add" onClick={() => addToCart(product)} disabled={product.stock < 1}><span>Quick add</span><Plus size={16} /></button>
              </div>
              <div className="product-meta"><div><h3>{product.name}</h3><span>{product.category}</span></div><div className="product-price">{product.compareAtPrice && <del>{money(product.compareAtPrice)}</del>}<strong>{money(product.price)}</strong></div></div>
              <div className="product-rating"><Star size={12} fill="currentColor" /><b>{product.rating}</b><span>({product.reviewCount})</span><span className="stock-copy">{product.stock < 12 ? "Low stock" : "In stock"}</span></div>
            </article>)}
          </div> : <div className="state-message"><strong>No pieces found.</strong><p>Reset the filters and see what is on the floor.</p><button className="text-button" onClick={() => { setSearch(""); setCategory("All"); }}>View all pieces <ArrowRight size={15} /></button></div>}
        </section>

        <section className="story-section" id="story">
          <div className="story-image"><span>NO COPIES</span><strong>ONLY<br />YOUR<br />SIGNATURE.</strong></div>
          <div className="story-copy"><p className="eyebrow"><span /> ABOUT THE ROOM</p><h2>Not more.<br /><em>Just better pairs.</em></h2><p>Kickroom is an independent edit of global sneaker culture. We bring together standout silhouettes, limited runs, and daily uniforms that earn their place on repeat.</p><a className="text-button" href="#shop">Enter the collection <ArrowRight size={16} /></a></div>
        </section>

        <section className="newsletter"><p className="eyebrow"><span /> FIRST ACCESS</p><h2>See the drop <em>before it drops.</em></h2><form onSubmit={(event) => { event.preventDefault(); setNotice("You are on the early-access list."); event.currentTarget.reset(); }}><input type="email" placeholder="Email address" required aria-label="Email address" /><button aria-label="Subscribe"><ArrowRight size={18} /></button></form></section>
      </main>

      <footer className="site-footer"><a className="wordmark" href="#">KICK<span>ROOM</span></a><span>INDIA / WORLDWIDE</span><span>© {new Date().getFullYear()} KICKROOM</span><a href="#shop">Back to top ↑</a></footer>

      {notice && <div className="toast" role="status"><Check size={17} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={15} /></button></div>}
      {cartOpen && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}><aside className="cart-drawer" aria-label="Shopping bag">
        <div className="drawer-heading"><div><p className="eyebrow">YOUR BAG</p><h2>{cartCount} {cartCount === 1 ? "piece" : "pieces"}</h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag"><X /></button></div>
        {cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={30} /><h3>The room is empty.</h3><p>Add a pair or an essential.</p><button className="button button-dark" onClick={() => setCartOpen(false)}>Keep browsing <ArrowRight size={15} /></button></div> : <>
          <div className="shipping-progress">{subtotal >= FREE_SHIPPING_THRESHOLD ? "Free shipping unlocked." : `${money(FREE_SHIPPING_THRESHOLD - subtotal)} away from free shipping.`}<div className="progress-track"><span style={{ width: `${Math.min(100, subtotal / FREE_SHIPPING_THRESHOLD * 100)}%` }} /></div></div>
          <div className="cart-items">{cart.map((item) => <div className="cart-item" key={item._id}><img src={item.image} alt="" /><div className="cart-item-info"><h3>{item.name}</h3><span>{money(item.price)}</span><div className="quantity"><button aria-label={`Remove one ${item.name}`} onClick={() => updateQuantity(item._id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label={`Add one ${item.name}`} onClick={() => updateQuantity(item._id, 1)} disabled={item.quantity >= item.stock}><Plus size={13} /></button></div></div><button className="remove-item" onClick={() => setCart((items) => items.filter((product) => product._id !== item._id))}>Remove</button></div>)}</div>
          <div className="cart-summary"><div><span>Subtotal</span><span>{money(subtotal)}</span></div><div><span>Shipping</span><span>{shipping ? money(shipping) : "Free"}</span></div><div className="cart-total"><span>Total</span><span>{money(total)}</span></div><button className="button button-dark checkout-button" onClick={() => setNotice("Checkout requires the connected store account.")}>Checkout <ArrowRight size={16} /></button></div>
        </>}
      </aside></div>}
    </>
  );
}

export default App;
