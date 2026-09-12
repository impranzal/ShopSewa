const Product = require('../models/Product');

const toSlug = (str) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

/**
 * ShopSewa Relevance Ranking Algorithm
 * ------------------------------------
 * When a text search query is present, MongoDB's $text search provides a raw
 * textScore per document. Raw text score alone tends to surface products that
 * merely mention a keyword many times, even if they are low-rated or out of
 * stock. We recompute a composite relevance score per product:
 *
 *   relevance = (textScore * 0.5)
 *             + (normalizedRating * 0.3)
 *             + (popularity * 0.15)
 *             + (inStockBonus * 0.05)
 *
 * where:
 *   normalizedRating = rating / 5                (0..1)
 *   popularity       = min(numReviews, 50) / 50  (0..1, capped so a handful
 *                       of viral products can't dominate every result page)
 *   inStockBonus     = 1 if stock > 0 else 0
 *
 * This keeps text relevance as the dominant factor (as expected for a search
 * feature) while still promoting well-reviewed, purchasable products over
 * keyword-stuffed or out-of-stock ones. Weights are tunable constants below.
 */
const RELEVANCE_WEIGHTS = { text: 0.5, rating: 0.3, popularity: 0.15, stock: 0.05 };

function computeRelevance(product, rawTextScore, maxTextScore) {
  const normalizedText = maxTextScore > 0 ? rawTextScore / maxTextScore : 0;
  const normalizedRating = (product.rating || 0) / 5;
  const popularity = Math.min(product.numReviews || 0, 50) / 50;
  const inStockBonus = product.stock > 0 ? 1 : 0;

  return (
    normalizedText * RELEVANCE_WEIGHTS.text +
    normalizedRating * RELEVANCE_WEIGHTS.rating +
    popularity * RELEVANCE_WEIGHTS.popularity +
    inStockBonus * RELEVANCE_WEIGHTS.stock
  );
}

exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
      const results = await Product.find(filter, { score: { $meta: 'textScore' } })
        .populate('category', 'name slug')
        .lean();

      const maxTextScore = Math.max(0, ...results.map((r) => r.score || 0));
      const ranked = results
        .map((r) => ({ ...r, relevance: computeRelevance(r, r.score || 0, maxTextScore) }))
        .sort((a, b) => b.relevance - a.relevance);

      const start = (Number(page) - 1) * Number(limit);
      const paged = ranked.slice(start, start + Number(limit));

      return res.json({
        products: paged,
        total: ranked.length,
        page: Number(page),
        pages: Math.ceil(ranked.length / Number(limit)),
      });
    }

    let query = Product.find(filter).populate('category', 'name slug');
    const sortMap = {
      priceAsc: 'price',
      priceDesc: '-price',
      rating: '-rating',
      newest: '-createdAt',
    };
    query = query.sort(sortMap[sort] || '-createdAt');

    const total = await Product.countDocuments(filter);
    const products = await query
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

/**
 * Related products: content-based filtering using the same category and a
 * price band within +/-30% of the source product's price, excluding itself.
 */
exports.getRelatedProducts = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const minPrice = product.price * 0.7;
  const maxPrice = product.price * 1.3;

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    price: { $gte: minPrice, $lte: maxPrice },
  })
    .limit(6)
    .populate('category', 'name slug');

  res.json(related);
};

exports.createProduct = async (req, res) => {
  try {
    const data = { ...req.body, slug: toSlug(req.body.name) };
    if (data.discountPrice && Number(data.discountPrice) >= Number(data.price)) {
      return res.status(400).json({ message: 'Discounted price must be lower than the regular price' });
    }
    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    if (req.body.price !== undefined && Number(req.body.price) < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }
    if (req.body.discountPrice !== undefined && Number(req.body.discountPrice) < 0) {
      return res.status(400).json({ message: 'Discounted price cannot be negative' });
    }
    const current = await Product.findById(req.params.id);
    if (!current) return res.status(404).json({ message: 'Product not found' });
    const price = req.body.price === undefined ? current.price : Number(req.body.price);
    const discountPrice = req.body.discountPrice === undefined ? current.discountPrice : Number(req.body.discountPrice);
    if (discountPrice > 0 && discountPrice >= price) {
      return res.status(400).json({ message: 'Discounted price must be lower than the regular price' });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
};
