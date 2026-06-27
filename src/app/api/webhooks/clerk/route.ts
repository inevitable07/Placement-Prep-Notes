/**
 * @file route.ts
 * @description Webhook endpoint handler for Clerk user events.
 * Performs signature verification using Svix to prevent replay attacks and spoofing.
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/db/repositories/UserRepository";

// Define TypeScript interfaces for Clerk Event payloads to avoid 'any'
interface EmailAddress {
  email_address: string;
}

interface UserCreatedEventData {
  id: string;
  email_addresses: EmailAddress[];
  created_at: number;
}

interface WebhookEvent {
  data: UserCreatedEventData | { id: string };
  type: string;
}

export async function POST(request: Request) {
  // Retrieve the webhook secret from env
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing CLERK_WEBHOOK_SECRET environment variable" },
      { status: 400 }
    );
  }

  // Get svix signature verification headers
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // If signature headers are missing, abort
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Error: Missing Svix signature headers" },
      { status: 400 }
    );
  }

  // Read request body as text
  let payloadString: string;
  try {
    payloadString = await request.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Error reading request body: ${message}` },
      { status: 400 }
    );
  }

  /**
   * CRITICAL SECURITY COMMENT:
   * We verify webhook signatures using Svix to validate that the request originated from Clerk.
   * This prevents request spoofing, tampering, and replay attacks where an attacker captures 
   * a valid payload and re-sends it to execute unauthorized operations.
   */
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payloadString, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Signature verification failed (e.g. invalid signature, replay attack detected)
    return NextResponse.json(
      { error: `Signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Process the verified webhook payload
  try {
    const eventType = evt.type;

    if (eventType === "user.created") {
      const data = evt.data as UserCreatedEventData;
      const { id, email_addresses } = data;
      const primaryEmail = email_addresses[0]?.email_address || "";

      if (!id || !primaryEmail) {
        return NextResponse.json(
          { error: "Error: Missing required Clerk user fields" },
          { status: 400 }
        );
      }

      try {
        await UserRepository.upsertFromWebhook(id, primaryEmail);
        console.log("[Webhook] User synced to MongoDB:", id);
        return NextResponse.json(
          { success: true, userId: id },
          { status: 200 }
        );
      } catch (dbErr) {
        // Log details internally but return 500 with a safe message (mask raw Mongoose messages)
        console.error("[Webhook] Failed to sync user to MongoDB:", dbErr);
        return NextResponse.json(
          { error: "Internal Server Error: Database synchronization failed." },
          { status: 500 }
        );
      }
    }

    if (eventType === "user.deleted") {
      const data = evt.data as { id: string };
      console.log(`[Webhook] User deleted: ${data.id}`);
      // For now: do NOT delete from MongoDB (preserve history data)
      return NextResponse.json(
        { success: true, message: "User deletion logged (document preserved)" },
        { status: 200 }
      );
    }

    // Default response for other event types
    return NextResponse.json(
      { received: true, eventType },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Error processing webhook payload: ${message}` },
      { status: 400 }
    );
  }
}
