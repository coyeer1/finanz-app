import { NextResponse } from "next/server";

export async function POST() {
  // Stripe webhook handler — placeholder for future implementation
  // Will handle: checkout.session.completed, customer.subscription.updated,
  // customer.subscription.deleted
  return NextResponse.json({ received: true });
}
