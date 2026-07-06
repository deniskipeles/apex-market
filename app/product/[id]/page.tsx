import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApexKit } from '@apexkit/sdk';
import { INITIAL_PRODUCTS, Product } from '@/lib/products';
import ProductDetailView from '@/components/ProductDetailView';

// Initialize the ApexKit SDK client
const apex = new ApexKit('https://kipeles-apexkit.hf.space', 'tenant', 'shop');

async function getProductById(id: string): Promise<Product | null> {
  try {
    const itemResult = await apex.collection('products').get(id);
    if (itemResult) {
      return {
        id: String(itemResult.id),
        name: String(itemResult.name || ''),
        description: String(itemResult.description || ''),
        price: Number(itemResult.price || 0),
        category: (itemResult.category || 'Lifestyle') as Product['category'],
        image: String(itemResult.image || ''),
        brand: String(itemResult.brand || ''),
        rating: Number(itemResult.rating || 4.5),
        reviewsCount: Number(itemResult.reviewsCount || 10),
        stock: Number(itemResult.stock !== undefined ? itemResult.stock : 10),
        tags: Array.isArray(itemResult.tags) ? itemResult.tags : (itemResult.tags ? String(itemResult.tags).split(',') : []),
        isRecommended: Boolean(itemResult.isRecommended),
      };
    }
  } catch (err: any) {
    console.warn(`ApexKit get failed for id: ${id}, falling back to local list.`, err.message);
  }

  // Fallback to local
  const localProd = INITIAL_PRODUCTS.find((p) => p.id === id);
  return localProd || null;
}

async function getAllProducts(): Promise<Product[]> {
  try {
    const listResult = await apex.collection('products').list({ per_page: 50 });
    if (listResult && listResult.items && listResult.items.length > 0) {
      return listResult.items.map((item: any) => ({
        id: String(item.id),
        name: String(item.name || ''),
        description: String(item.description || ''),
        price: Number(item.price || 0),
        category: (item.category || 'Lifestyle') as Product['category'],
        image: String(item.image || ''),
        brand: String(item.brand || ''),
        rating: Number(item.rating || 4.5),
        reviewsCount: Number(item.reviewsCount || 10),
        stock: Number(item.stock !== undefined ? item.stock : 10),
        tags: Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',') : []),
        isRecommended: Boolean(item.isRecommended),
      }));
    }
  } catch (err: any) {
    console.warn("ApexKit list failed inside detail server component:", err.message);
  }
  return INITIAL_PRODUCTS;
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found - ApexMarket',
      description: 'The requested product is not available on ApexMarket.',
    };
  }

  const title = `${product.name} | ${product.brand} - ApexMarket`;
  const description = `${product.description.substring(0, 155)}... Buy ${product.name} for $${product.price.toFixed(2)} on ApexMarket.`;
  const canonicalUrl = `https://apexmarket.com/product/${product.id}`;

  return {
    title,
    description,
    keywords: [product.category, product.brand, ...product.tags, 'ApexMarket', 'secure shopping', 'visual search'].join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'ApexMarket',
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const allProducts = await getAllProducts();

  // JSON-LD Structured Data Schema for Rich Search Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'id': `https://apexmarket.com/product/${product.id}`,
    'name': product.name,
    'image': product.image,
    'description': product.description,
    'brand': {
      '@type': 'Brand',
      'name': product.brand,
    },
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'USD',
      'price': product.price,
      'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'url': `https://apexmarket.com/product/${product.id}`,
      'itemCondition': 'https://schema.org/NewCondition',
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product.rating,
      'reviewCount': product.reviewsCount,
      'bestRating': '5',
      'worstRating': '1',
    },
  };

  return (
    <>
      {/* Insert JSON-LD directly into the HTML structure */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Interactive Detail Layout Component */}
      <ProductDetailView product={product} allProducts={allProducts} />
    </>
  );
}
