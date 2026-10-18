import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const inputDir = path.resolve("public/images");
const outputDir = path.resolve("public/optimized-images");

await fs.mkdir(outputDir, { recursive: true });

const supported = /\.(jpe?g|png|webp)$/i;
const files = (await fs.readdir(inputDir))
  .filter((file) => supported.test(file));

for (const file of files) {
  const input = path.join(inputDir, file);
  const output = path.join(
    outputDir,
    `${path.parse(file).name}.webp`
  );

  await sharp(input)
    .rotate()
    .resize({
      width: 1800,
      height: 1800,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 5 })
    .toFile(output);

  const [before, after] = await Promise.all([
    fs.stat(input),
    fs.stat(output),
  ]);

  console.log(
    `${file}: ${(before.size / 1024 / 1024).toFixed(2)} MB -> ` +
    `${(after.size / 1024 / 1024).toFixed(2)} MB`
  );
}