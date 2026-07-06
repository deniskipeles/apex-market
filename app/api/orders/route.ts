import { ApexKit } from '@apexkit/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Initialize ApexKit Client for tenant 'shop' with URL 'https://kipeles-apexkit.hf.space'
const apex = new ApexKit('https://kipeles-apexkit.hf.space', 'tenant', 'shop');

const ORDER_SCHEMA = {
  fields: {
    orderId: { name: 'orderId', type: 'text', required: true },
    items: { name: 'items', type: 'json' },
    total: { name: 'total', type: 'number' },
    date: { name: 'date', type: 'text' },
    status: { name: 'status', type: 'text' },
    address: { name: 'address', type: 'text' },
    city: { name: 'city', type: 'text' },
    zip: { name: 'zip', type: 'text' },
    paymentMethod: { name: 'paymentMethod', type: 'text' },
    trackingStep: { name: 'trackingStep', type: 'number' }
  }
};

async function ensureOrdersCollection() {
  try {
    await apex.admins.getCollection('orders');
  } catch (err: any) {
    if (err.message?.includes('not found') || err.status === 404) {
      console.log("Orders collection not found, attempting to create...");
      try {
        await apex.admins.createCollection('orders', ORDER_SCHEMA);
      } catch (createErr: any) {
        console.error("Failed to auto-create orders collection:", createErr.message);
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const orderData = await req.json();
    
    // Create a persistent record in the 'orders' collection
    let created;
    try {
      created = await apex.collection('orders').create({
        orderId: orderData.id,
        items: orderData.items,
        total: Number(orderData.total),
        date: orderData.date,
        status: orderData.status,
        address: orderData.address,
        city: orderData.city,
        zip: orderData.zip,
        paymentMethod: orderData.paymentMethod,
        trackingStep: Number(orderData.trackingStep || 1),
      });
    } catch (err: any) {
      if (err.message?.includes('not found') || err.status === 404) {
        await ensureOrdersCollection();
        // Retry create after creation
        created = await apex.collection('orders').create({
          orderId: orderData.id,
          items: orderData.items,
          total: Number(orderData.total),
          date: orderData.date,
          status: orderData.status,
          address: orderData.address,
          city: orderData.city,
          zip: orderData.zip,
          paymentMethod: orderData.paymentMethod,
          trackingStep: Number(orderData.trackingStep || 1),
        });
      } else {
        throw err;
      }
    }

    return NextResponse.json({ success: true, order: created });
  } catch (err: any) {
    console.error("Failed to log order to ApexKit backend:", err);
    // Don't fail completely on client checkout; allow local fallback mode
    return NextResponse.json({ error: err.message, isFallbackMode: true }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const listResult = await apex.collection('orders').list({ per_page: 50 });
    return NextResponse.json({
      orders: listResult?.items || [],
      source: 'apexkit'
    });
  } catch (err: any) {
    if (err.message?.includes('not found') || err.status === 404) {
      await ensureOrdersCollection();
      // Collection doesn't exist yet, return empty list instead of erroring
      return NextResponse.json({ orders: [], source: 'apexkit-empty' });
    }
    console.error("Failed to fetch orders from ApexKit backend:", err);
    return NextResponse.json({ orders: [], error: err.message });
  }
}
