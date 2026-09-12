const productImages = {
  earbuds: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=85',
  phone: 'https://images.unsplash.com/photo-1581795669633-91ef7c9699a8?auto=format&fit=crop&w=800&q=85',
  tshirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85',
  kurta: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
  rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=85',
  honey: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=85',
  notebook: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=85',
  books: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=85',
};

export function getProductImage(product, size = 800) {
  const existing = product?.images?.find(
    (image) => image && !image.includes('loremflickr.com') && !image.includes('picsum.photos')
  );
  if (existing) return existing;

  const text = `${product?.name || ''} ${product?.keyword || ''}`.toLowerCase();
  const key = text.includes('fiction') || text.includes('book') || text.includes('novel')
    ? 'books'
    : text.includes('t-shirt') || text.includes('t shirt') || text.includes('tee')
      ? 'tshirt'
      : Object.keys(productImages).find((candidate) => text.includes(candidate));
  const image = productImages[key] || 'https://images.unsplash.com/photo-1607082348824-0a96f2a18f6e?auto=format&fit=crop&w=800&q=85';
  return image.replace('w=800', `w=${size}`);
}

export const heroImages = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=85',
];
