import { basename, join } from "./deps.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.23.1/mod.js";

import { fm } from "./bundlet.ts";

let rootDir = "node_modules";
let server: Deno.HttpServer;
let port = 12346;
const ext = /\.(m?js|ts)$/i;

function modulesServe(port = 0, root?: string) {
  if (root) {
    rootDir = root;
  }
  try {
    const info = Deno.statSync(rootDir);
    if (info?.isFile) {
      return;
    }
  } catch {
    return;
  }
  server = Deno.serve(
    { port: port || 12345, hostname: "localhost" },
    handlers,
  );
}

function found(flpath: string, base: string): string {
  let info;
  let abs = false;
  if (!flpath.startsWith(".")) {
    abs = true;
    flpath = join(rootDir, flpath);
  } else {
    flpath = join(base, flpath);
  }
  try {
    info = Deno.statSync(flpath);
  } catch {
    // skip
  }
  const name = basename(flpath);
  if (info?.isFile || ext.test(name)) {
    return info?.isFile ? flpath : "";
  }
  const prefixes = [".esm", ".es6", ".es", ".module", ""];
  const exts = (abs
    ? [
      ...([".ts", ".js", ".module.js"].map((
        x,
      ) => [`/${name}${x}`, `/dist/${name}${x}`, `/build/${name}${x}`]))
        .flat(),
      ...(prefixes.map((
        x,
      ) => [
        `/index${x}.js`,
        `/dist/index${x}.js`,
        `/dist/esm/index${x}.js`,
        `/build/index${x}.js`,
      ]))
        .flat(),
    ]
    : []).concat([".ts", ...(prefixes.map((x) => `${x}.js`)), ".mjs"]);
  for (let i = 0; i < exts.length; i++) {
    try {
      const src = `${flpath}${exts[i]}`;
      info = Deno.statSync(src);
      if (info.isFile || info.isSymlink) {
        flpath = src;
        break;
      }
      if (info.isDirectory) {
        continue;
      }
    } catch {
      // skip
    }
  }
  if (!info?.isFile) {
    return "";
  }
  return flpath;
}

const xfrom = /((?:^import|\simport|\s+from)\s*['"])([^'"]+)(['"])/g;
const xnpm = /^(src\/)?(npm>:)/i;

async function handlers(req: any) {
  const url = new URL(req.url.replace(/\/cjs\//g, "/esm/"));
  const flpath = found(
    decodeURIComponent(url.pathname.substring(1)),
    rootDir,
  );
  if (!flpath) {
    return new Response("404 Not Found", { status: 404 });
  }
  const body = await Deno.readTextFile(flpath);
  const base = path.dirname(flpath);
  const result = body.replace(xfrom, (s, m1, m2, m3) => {
    if (m2.startsWith(".") && ext.test(m2)) {
      return s;
    }
    const src = found(m2, base);
    const m = src.match(ext);
    if (m) {
      const target = src.startsWith(rootDir)
        ? `npm>:${src.substring(rootDir.length + 1)}`
        : `${m2}${m[0]}`;
      return [m1, target, m3].join("");
    }
    return s;
  });
  return new Response(result, {
    headers: {
      "Content-Type": `text/${
        /\.ts$/i.test(flpath) ? "typescript" : "javascript"
      }`,
      "Cache-Control": "no-cache",
    },
  });
}

export function serve(dirPort = "") {
  if (/^(no|off|false|-)$/i.test(dirPort)) return;
  const i = dirPort.indexOf(":");
  let root = "";
  if (i > -1) {
    port = parseInt(dirPort.substring(i + 1), 10);
    root = dirPort.substring(0, i);
  } else {
    root = dirPort;
  }
  modulesServe(port > 0 ? port : 0, root);
}

export async function close() {
  await server?.shutdown();
}

export const resolveSrc = (src: string) => {
  if (!validSrc(src)) {
    return src;
  }
  return `http://localhost:${port}/${src.replace(xnpm, "")}`;
};

export const target = (target: string) => {
  return target.replace(xnpm, "npm/");
};

export const validSrc = (src: string) => {
  return xnpm.test(src);
};

export function pure(src: string) {
  src = src.replace(/\b(esm|cjs|mjs|dist|build)\//g, "").replace(
    /\/index[^/]+$/,
    "",
  );
  return xnpm.test(src) ? src.substring(src.indexOf(":") + 1) : basename(src);
}

export const resolve = {
  name: "npm-local-modules",
  setup(build: esbuild.PluginBuild) {
    build.onResolve({ filter: xnpm }, (args: esbuild.OnResolveArgs) => {
      const name = pure(args.path).replace(/\.js$/, "");
      if (fm[name]) {
        return { path: fm[name], external: true };
      }
      if (!server) {
        return { path: args.path };
      }
      return {
        path: resolveSrc(args.path).replace("http:", ""),
        namespace: "http",
      };
    });
  },
} as esbuild.Plugin;
