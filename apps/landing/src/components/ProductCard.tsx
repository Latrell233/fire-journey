import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Product } from '../data/products';

interface Props {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: Props) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white rounded-card p-5 shadow-sm ${product.available ? 'active:scale-[0.98] transition-transform' : 'opacity-60'}`}
      style={{ borderLeft: `4px solid ${product.color}` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
          style={{ color: product.color, background: `${product.color}15` }}
        >
          STEP {product.step} · {product.subtitle}
        </span>
      </div>
      <h3 className="text-lg font-bold text-text mb-1.5">{product.title}</h3>
      <p className="text-[13px] text-[#8a7a6a] leading-relaxed">{product.description}</p>

      <div className="mt-3">
        {product.available ? (
          <span className="inline-block px-5 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: product.color }}>
            开始测试 →
          </span>
        ) : (
          <span className="inline-block px-5 py-2 rounded-full text-sm font-medium text-[#8a7a6a] bg-muted">
            即将上线
          </span>
        )}
      </div>
    </motion.div>
  );

  if (product.available) {
    return <Link to={product.path} className="block">{card}</Link>;
  }
  return card;
}
