import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }
    return NextResponse.json(admin);
  } catch (error) {
    console.error("GET me error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
