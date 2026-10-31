import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    throw new Error("Sentry Test Error from Kuota Next.js API");
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({
      status: "ok",
      message: "Sentry test exception captured and sent successfully",
      org: "kuota-cp",
      project: "5136976",
    });
  }
}
