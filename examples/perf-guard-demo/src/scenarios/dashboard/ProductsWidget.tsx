import { useEffect, useState } from "react";
import { PerfProfiler } from "react-perf-guard";

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
}

// 🐛 The bug: a "last updated" clock lives in the SAME component as the
// product grid and ticks every second. Since the grid markup isn't split
// into its own memoized component, every tick re-renders all product cards
// too — even though the product data hasn't changed at all. This is a very
// common real-world mistake: a live timestamp/clock sharing a component
// with an expensive list.
export default function ProductsWidget() {
  const [products, setProducts] = useState<Product[]>([]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    fetch("https://dummyjson.com/products?limit=8")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <PerfProfiler id="ProductsWidget" boundaryType="LAYOUT">
      <div className="widget">
        <div className="widget-header-row">
          <h3 className="widget-title">🛍️ Product Grid</h3>
          <span className="widget-clock">{now.toLocaleTimeString()}</span>
        </div>
        <p className="widget-source">dummyjson.com/products</p>
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <img src={p.thumbnail} alt="" loading="lazy" />
              <div className="product-title">{p.title}</div>
              <div className="product-price">${p.price}</div>
            </div>
          ))}
        </div>
      </div>
    </PerfProfiler>
  );
}
