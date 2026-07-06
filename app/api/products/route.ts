import { ApexKit } from '@apexkit/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PRODUCTS, Product } from '@/lib/products';

// Initialize the ApexKit SDK client for tenant 'shop' with URL 'https://kipeles-apexkit.hf.space'
const apex = new ApexKit('https://kipeles-apexkit.hf.space', 'tenant', 'shop');

const PRODUCT_SCHEMA = {
  fields: {
    name: { name: 'name', type: 'text', required: true },
    description: { name: 'description', type: 'text', required: false },
    price: { name: 'price', type: 'number', required: true },
    category: { name: 'category', type: 'text', required: false },
    image: { name: 'image', type: 'text', required: false },
    brand: { name: 'brand', type: 'text', required: false },
    rating: { name: 'rating', type: 'number', required: false },
    reviewsCount: { name: 'reviewsCount', type: 'number', required: false },
    stock: { name: 'stock', type: 'number', required: false },
    tags: { name: 'tags', type: 'json', required: false },
    isRecommended: { name: 'isRecommended', type: 'boolean', required: false }
  }
};

async function ensureProductsCollection() {
  try {
    // Try to ensure tenant exists (this might fail if not root admin, but we catch it)
    try { await apex.admins.createTenant('shop'); } catch (e) {}
    
    await apex.admins.getCollection('products');
  } catch (err: any) {
    if (err.message?.includes('not found') || err.status === 404) {
      console.log("Products collection not found, attempting to create...");
      try {
        await apex.admins.createCollection('products', PRODUCT_SCHEMA);
      } catch (createErr: any) {
        console.error("Failed to auto-create products collection:", createErr.message);
      }
    }
  }
}

export async function GET(req: NextRequest) {
  let listResult;
  try {
    // Fetch products list from ApexKit products collection
    listResult = await apex.collection('products').list({ per_page: 50 });
  } catch (err: any) {
    console.warn("Initial ApexKit fetch failed (likely collection not found):", err.message);
    
    // If it's a 'not found' error, we try to create the collection
    if (err.message?.includes('not found') || err.status === 404) {
      await ensureProductsCollection();
    } else {
      return NextResponse.json({ products: INITIAL_PRODUCTS, source: 'local-fallback-error', error: err.message });
    }
  }

  try {
    if (listResult && listResult.items && listResult.items.length > 0) {
      const products: Product[] = listResult.items.map((item: any) => ({
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

      return NextResponse.json({ products, source: 'apexkit' });
    }

    // Auto-seeding: If collection is empty or was not found, seed it with the default initial catalog
    console.log("ApexKit products collection is empty or missing. Auto-seeding initial products...");
    try {
      for (const prod of INITIAL_PRODUCTS) {
        await apex.collection('products').create({
          name: prod.name,
          description: prod.description,
          price: prod.price,
          category: prod.category,
          image: prod.image,
          brand: prod.brand,
          rating: prod.rating,
          reviewsCount: prod.reviewsCount,
          stock: prod.stock,
          tags: prod.tags,
          isRecommended: prod.isRecommended,
        });
      }

      // Fetch again after seeding
      const secondTry = await apex.collection('products').list({ per_page: 50 });
      if (secondTry && secondTry.items && secondTry.items.length > 0) {
        const products: Product[] = secondTry.items.map((item: any) => ({
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
        return NextResponse.json({ products, source: 'apexkit-seeded' });
      }
    } catch (seedErr) {
      console.error("Failed to seed initial catalog in ApexKit:", seedErr);
    }

    return NextResponse.json({ products: INITIAL_PRODUCTS, source: 'local-fallback' });
  } catch (err: any) {
    console.error("Critical error in products GET handler:", err);
    return NextResponse.json({ products: INITIAL_PRODUCTS, source: 'local-fallback-error', error: err.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const prod = await req.json();
    const created = await apex.collection('products').create({
      name: prod.name,
      description: prod.description,
      price: Number(prod.price || 0),
      category: prod.category,
      image: prod.image,
      brand: prod.brand,
      rating: Number(prod.rating || 5.0),
      reviewsCount: Number(prod.reviewsCount || 1),
      stock: Number(prod.stock !== undefined ? prod.stock : 10),
      tags: prod.tags,
      isRecommended: Boolean(prod.isRecommended),
    });

    return NextResponse.json({
      success: true,
      product: {
        id: String(created.id),
        name: String(created.name),
        description: String(created.description || ''),
        price: Number(created.price),
        category: created.category as Product['category'],
        image: String(created.image || ''),
        brand: String(created.brand || ''),
        rating: Number(created.rating || 5.0),
        reviewsCount: Number(created.reviewsCount || 1),
        stock: Number(created.stock),
        tags: Array.isArray(created.tags) ? created.tags : [],
        isRecommended: Boolean(created.isRecommended),
      }
    });
  } catch (err: any) {
    console.error("Failed to add product to ApexKit:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, stock } = await req.json();
    const updated = await apex.collection('products').patch(id, { stock: Number(stock) });

    return NextResponse.json({
      success: true,
      product: {
        id: String(updated.id),
        name: String(updated.name),
        description: String(updated.description || ''),
        price: Number(updated.price),
        category: updated.category as Product['category'],
        image: String(updated.image || ''),
        brand: String(updated.brand || ''),
        rating: Number(updated.rating || 5.0),
        reviewsCount: Number(updated.reviewsCount || 1),
        stock: Number(updated.stock),
        tags: Array.isArray(updated.tags) ? updated.tags : [],
        isRecommended: Boolean(updated.isRecommended),
      }
    });
  } catch (err: any) {
    console.error("Failed to update product stock in ApexKit:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing product ID parameter" }, { status: 400 });
    }

    await apex.collection('products').delete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete product from ApexKit:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
