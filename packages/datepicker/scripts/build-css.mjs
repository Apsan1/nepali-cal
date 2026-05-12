import { readFileSync, writeFileSync } from "fs";
import { transform } from "lightningcss";

const input = "src/styles.css";
const output = "dist/styles.css";

const css = readFileSync(input, "utf8");

const result = transform({
  filename: input,
  code: Buffer.from(css),
  minify: true,
});

writeFileSync(output, result.code);
