import { ApexKit } from '@apexkit/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Initialize ApexKit Client for tenant 'shop' with URL 'https://kipeles-apexkit.hf.space'
const apex = new ApexKit('https://kipeles-apexkit.hf.space', 'tenant', 'shop');

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, metadata } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (action === 'login') {
      const authRes = await apex.auth.login(email, password);
      return NextResponse.json({
        success: true,
        token: authRes.token,
        user: {
          name: authRes.user.metadata?.name || email.split('@')[0],
          email: authRes.user.email,
          isLoggedIn: true,
          interests: authRes.user.metadata?.interests || ['Electronics', 'Wellness'],
          purchaseHistory: authRes.user.metadata?.purchaseHistory || [],
        }
      });
    } else if (action === 'register') {
      // Register new user on ApexKit backend
      const authRes = await apex.auth.register(email, password, {
        name: metadata?.name || email.split('@')[0],
        interests: metadata?.interests || ['Electronics', 'Wellness'],
        purchaseHistory: [],
      });

      return NextResponse.json({
        success: true,
        token: authRes.token,
        user: {
          name: metadata?.name || email.split('@')[0],
          email: authRes.user.email,
          isLoggedIn: true,
          interests: metadata?.interests || ['Electronics', 'Wellness'],
          purchaseHistory: [],
        }
      });
    } else {
      return NextResponse.json({ error: "Invalid authentication action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("ApexKit Auth Endpoint Error:", err);
    return NextResponse.json({ error: err.message || "Authentication failed" }, { status: 500 });
  }
}
