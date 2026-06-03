import HeroSection from './components/HeroSection';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import { products } from './data/products';

export default function App() {
  return (
    <div className="mx-auto max-w-[480px] min-h-screen bg-surface md:shadow-sm">
      <HeroSection />
      <main className="px-4 py-6 flex flex-col gap-3">
        <p className="text-[13px] text-[#8a7a6a] text-center mb-1">选择你的起点</p>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </main>
      <Footer />
    </div>
  );
}
