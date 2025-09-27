import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { demoProducts, demoVendors } from '../lib/demoData';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find product by ID
    const foundProduct = demoProducts.find(p => p._id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedImage(0);

      // Find vendor information
      const foundVendor = demoVendors.find(v => v.id === foundProduct.vendorId);
      setVendor(foundVendor);
    }
    setLoading(false);
  }, [id]);

  const addToCart = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      navigate('/auth');
      return;
    }

    // Add to cart logic (simplified for demo)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.product._id === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        product,
        quantity,
        vendorId: product.vendorId
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Added ${quantity} ${product.unit}(s) to cart!`);
  };

  const updateQuantity = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.quantityAvailable) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/marketplace" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to="/marketplace" className="text-gray-500 hover:text-gray-700">Marketplace</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  product.category === 'seafood' ? 'bg-blue-100 text-blue-800' :
                  product.category === 'spices' ? 'bg-yellow-100 text-yellow-800' :
                  product.category === 'vegetables' ? 'bg-green-100 text-green-800' :
                  product.category === 'grains' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </span>
                {product.isOnSale && (
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    On Sale
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="ml-1 text-lg font-semibold">{product.rating}</span>
                  <span className="ml-1 text-gray-600">({product.reviewCount} reviews)</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{product.origin}</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-green-600">₦{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    ₦{product.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-gray-600">per {product.unit}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Nutritional Info */}
            {product.nutritionalInfo && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Nutritional Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Product Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Packaging:</span>
                  <span className="ml-2 font-medium">{product.packaging}</span>
                </div>
                <div>
                  <span className="text-gray-600">Shelf Life:</span>
                  <span className="ml-2 font-medium">{product.shelfLife}</span>
                </div>
                <div>
                  <span className="text-gray-600">Origin:</span>
                  <span className="ml-2 font-medium">{product.origin}</span>
                </div>
                <div>
                  <span className="text-gray-600">Organic:</span>
                  <span className="ml-2 font-medium">{product.isOrganic ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Quantity:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(1)}
                    disabled={quantity >= product.quantityAvailable}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Stock:</span>
                <span className={`font-medium ${
                  product.quantityAvailable > 10 ? 'text-green-600' :
                  product.quantityAvailable > 0 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {product.quantityAvailable > 0
                    ? `${product.quantityAvailable} ${product.unit}s available`
                    : 'Out of stock'
                  }
                </span>
              </div>

              <button
                onClick={addToCart}
                disabled={product.quantityAvailable === 0}
                className={`cta-primary w-full py-3 px-6 text-lg ${
                  product.quantityAvailable === 0
                    ? 'opacity-50 cursor-not-allowed pointer-events-none'
                    : ''
                }`}
              >
                {product.quantityAvailable === 0 ? 'Out of Stock' : `Add ${quantity} ${product.unit}${quantity > 1 ? 's' : ''} to Cart`}
              </button>

              <div className="mt-4 text-center">
                <Link
                  to="/checkout"
                  className="cta-secondary"
                >
                  View Cart & Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        {vendor && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-6">
              <img
                src={vendor.image}
                alt={vendor.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{vendor.name}</h2>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 font-semibold">{vendor.rating}</span>
                    <span className="ml-1 text-gray-600">({vendor.reviewCount} reviews)</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{vendor.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{vendor.products}</div>
                    <div className="text-sm text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{vendor.established}</div>
                    <div className="text-sm text-gray-600">Established</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{vendor.location}</div>
                    <div className="text-sm text-gray-600">Location</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {vendor.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Link
                    to={`/vendor/${vendor.id}`}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Vendor Profile
                  </Link>
                  <Link
                    to={`/marketplace?vendor=${vendor.id}`}
                    className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {demoProducts
              .filter(p => p.category === product.category && p._id !== product._id)
              .slice(0, 4)
              .map(relatedProduct => (
                <Link
                  key={relatedProduct._id}
                  to={`/product/${relatedProduct._id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{relatedProduct.name}</h3>
                    <p className="text-green-600 font-bold">₦{relatedProduct.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
