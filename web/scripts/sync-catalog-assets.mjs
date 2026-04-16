import { put } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function escapeSql(value) {
  return value.replaceAll("'", "''");
}

function stripMotifPrefix(filename, motif) {
  return filename.replace(new RegExp(`^ns-\\d{2}-${motif}-`), "");
}

function requireAsset(entry, matcher, description) {
  const asset = entry.web.find(({ path: assetPath }) => matcher(assetPath));
  if (!asset) {
    throw new Error(`Missing ${description} asset for motif "${entry.motif}".`);
  }
  return asset;
}

function requirePrintPdf(entry) {
  const asset = entry.print.find(({ path: assetPath }) => assetPath.endsWith("-print-300dpi.pdf"));
  if (!asset) {
    throw new Error(`Missing print PDF asset for motif "${entry.motif}".`);
  }
  return asset;
}

async function uploadAsset(sourcePath, pathname) {
  const bytes = await readFile(sourcePath);
  return put(pathname, bytes, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN.");
  }

  const manifestPath =
    getArg("--manifest") ?? path.join(repoRoot, "motifs/exports/manifest.json");
  const sqlPath = getArg("--sql");
  const reportPath = getArg("--report");

  if (!sqlPath) {
    throw new Error("Missing required --sql output path.");
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const updates = [];
  const uploads = [];

  for (const entry of manifest) {
    const uploadedUrls = new Map();

    for (const asset of entry.web) {
      const sourcePath = path.join(repoRoot, asset.path);
      const fileName = path.basename(asset.path);
      const blobPath = `prints/${entry.motif}/${stripMotifPrefix(fileName, entry.motif)}`;
      const result = await uploadAsset(sourcePath, blobPath);
      uploadedUrls.set(fileName, result.url);
      uploads.push({ motif: entry.motif, kind: "web", sourcePath: asset.path, blobPath, url: result.url });
    }

    const printPdf = requirePrintPdf(entry);
    const printResult = await uploadAsset(
      path.join(repoRoot, printPdf.path),
      `prints/${entry.motif}/print-file.pdf`
    );
    uploads.push({
      motif: entry.motif,
      kind: "print",
      sourcePath: printPdf.path,
      blobPath: `prints/${entry.motif}/print-file.pdf`,
      url: printResult.url,
    });

    const webPreview = requireAsset(entry, (assetPath) => assetPath.endsWith("-web-2400.webp"), "web preview");
    const thumbnail = requireAsset(entry, (assetPath) => assetPath.endsWith("-thumb-1200.webp"), "thumbnail");
    const og = requireAsset(entry, (assetPath) => assetPath.endsWith("-og-1200.jpg"), "OG image");

    updates.push({
      slug: entry.motif,
      image_web_preview_url: uploadedUrls.get(path.basename(webPreview.path)),
      image_thumbnail_url: uploadedUrls.get(path.basename(thumbnail.path)),
      image_og_url: uploadedUrls.get(path.basename(og.path)),
    });
  }

  const sql = `${updates
    .map(
      (update) => `update public.prints
set
  image_web_preview_url = '${escapeSql(update.image_web_preview_url)}',
  image_thumbnail_url = '${escapeSql(update.image_thumbnail_url)}',
  image_og_url = '${escapeSql(update.image_og_url)}'
where slug = '${escapeSql(update.slug)}';`
    )
    .join("\n\n")}
`
    .trim()
    .concat("\n");

  await mkdir(path.dirname(sqlPath), { recursive: true });
  await writeFile(sqlPath, sql, "utf8");

  if (reportPath) {
    await mkdir(path.dirname(reportPath), { recursive: true });
    await writeFile(reportPath, JSON.stringify({ uploads, updates }, null, 2), "utf8");
  }

  process.stdout.write(
    JSON.stringify(
      {
        motifs: updates.length,
        uploads: uploads.length,
        sqlPath,
        reportPath,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
