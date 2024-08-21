export {
  basename,
  dirname,
  fromFileUrl,
  join,
  relative,
  resolve,
  toFileUrl,
} from "jsr:@std/path";
export { join as posixPathJoin } from "jsr:@std/path/posix";
export { ensureDir, exists } from "jsr:@std/fs";
export { parse as parseJsonC } from "jsr:@std/jsonc";
export { parse as parseFlags } from "jsr:@std/flags";
export { red } from "jsr:@std/fmt/colors";
export { MuxAsyncIterator } from "jsr:@std/async";
export { walk } from "jsr:@std/fs/walk";
export {
  denoLoaderPlugin,
  denoPlugins,
  denoResolverPlugin,
} from "jsr:@luca/esbuild-deno-loader";
export { build, stop } from "https://deno.land/x/esbuild@v0.17.19/mod.js";
export type {
  BuildOptions,
  CommonOptions,
  OnResolveArgs,
  Plugin,
  PluginBuild,
} from "https://deno.land/x/esbuild@v0.17.19/mod.js";
export { Document, DOMParser, Element } from "jsr:@b-fuze/deno-dom/wasm";

export { opn } from "https://raw.githubusercontent.com/hashrock/deno-opn/b358e4c7df5d1c6d5e634d2730ca491ba6062782/opn.ts";
export { serve as serveIterable } from "https://deno.land/x/iterable_file_server@v0.2.0/mod.ts";

export const NAME = "packup";
export const VERSION = "v0.2.6";

export { crypto } from "jsr:@std/crypto";
import { encodeHex } from "jsr:@std/encoding";
export { encodeHex };

export const md5sum = async function (data: string | ArrayBuffer) {
  const d = await crypto.subtle.digest(
    "MD5",
    typeof data === "string" ? new TextEncoder().encode(data) : data,
  );
  return await encodeHex(d);
};
