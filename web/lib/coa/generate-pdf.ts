export interface CoaPdfInput {
  buyerName: string;
  editionNumber: number;
  motifTitle: string;
  formatLabel: string;
  issuedAt: string;
  editionSize?: number;
}

function toPdfText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildPdf(objects: string[]): Buffer {
  let output = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(output, "utf8"));
    output += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(output, "utf8");
  output += `xref\n0 ${objects.length + 1}\n`;
  output += "0000000000 65535 f \n";

  for (const offset of offsets) {
    output += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(output, "utf8");
}

export async function generateCoaPdf(input: CoaPdfInput): Promise<Buffer> {
  if (
    !input.buyerName.trim() ||
    !input.motifTitle.trim() ||
    !input.formatLabel.trim() ||
    !input.issuedAt.trim() ||
    input.editionNumber < 1
  ) {
    throw new Error("Missing required COA PDF fields.");
  }

  const editionSize = input.editionSize ?? 150;
  const lines = [
    "Certificate of Authenticity",
    "",
    `Werk: ${input.motifTitle}`,
    `Edition: ${input.editionNumber} / ${editionSize}`,
    `Format: ${input.formatLabel}`,
    `Ausgestellt fuer: ${input.buyerName}`,
    `Datum: ${input.issuedAt}`,
    "",
    "Dieser Druck ist Teil der limitierten, nummerierten Edition.",
    "Die physische Signatur erfolgt handschriftlich auf dem beigefuegten Zertifikat.",
    "",
    "Signatur: ____________________________",
  ];

  const content = [
    "BT",
    "/F1 18 Tf",
    "72 760 Td",
    ...lines.flatMap((line, index) =>
      index === 0
        ? [`(${toPdfText(line)}) Tj`]
        : ["0 -24 Td", `(${toPdfText(line)}) Tj`]
    ),
    "ET",
  ].join("\n");

  return buildPdf([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
  ]);
}
