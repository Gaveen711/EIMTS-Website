import { readdir, stat, unlink } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import sharp from "sharp";

const projectImageRoot = resolve(process.cwd(), "public", "assets", "projects");
const removeSources = process.argv.includes("--remove-source");

async function imageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? imageFiles(path) : [path];
    }),
  );
  return nested.flat();
}

const sources = (await imageFiles(projectImageRoot)).filter((path) =>
  /\.jpe?g$/i.test(extname(path)),
);

let originalBytes = 0;
let webpBytes = 0;

for (const source of sources) {
  const target = source.replace(/\.jpe?g$/i, ".webp");
  const resolvedTarget = resolve(target);
  if (!resolvedTarget.startsWith(`${projectImageRoot}${sep}`)) {
    throw new Error(`Refusing to write outside ${projectImageRoot}`);
  }

  const sourceStats = await stat(source);
  await sharp(source)
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80, effort: 6 })
    .toFile(target);
  const targetStats = await stat(target);
  originalBytes += sourceStats.size;
  webpBytes += targetStats.size;

  if (removeSources) await unlink(source);
  console.log(`${relative(projectImageRoot, source)} -> ${relative(projectImageRoot, target)}`);
}

const savedPercent = originalBytes
  ? Math.round((1 - webpBytes / originalBytes) * 100)
  : 0;
console.log(
  `${sources.length} images converted in ${relative(process.cwd(), dirname(projectImageRoot))}; ` +
    `${Math.round(originalBytes / 1024 / 1024)} MB -> ${Math.round(webpBytes / 1024 / 1024)} MB (${savedPercent}% smaller).`,
);
