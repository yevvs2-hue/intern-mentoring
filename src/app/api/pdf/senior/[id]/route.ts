import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { readStore } from "@/lib/store";
import { SeniorPDF } from "@/lib/pdf-templates";
import React from "react";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await readStore();
  const s = store.senior.find((m) => m.id === id);

  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stream = await renderToStream(React.createElement(SeniorPDF, { s }));

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);
  const filename = encodeURIComponent(`선배탐구_${s.internName}_${s.date}.pdf`);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
