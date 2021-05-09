import {
  Document,
  Element,
} from "https://deno.land/x/deno_dom@v0.1.9-alpha/deno-dom-wasm.ts";
import { createHash, fromFileUrl } from "./deps.ts";

export const decoder = new TextDecoder();
export const encoder = new TextEncoder();

export function md5(data: string | ArrayBuffer): string {
  const hash = createHash("md5");
  hash.update(data);
  return hash.toString();
}

export async function getDependencies(path: string): Promise<string[]> {
  const p = Deno.run({
    cmd: [Deno.execPath(), "info", "--json", path],
    stdout: "piped",
    stderr: "piped",
  });
  const [status, output, stderrOutput] = await Promise.all([p.status(), p.output(), p.stderrOutput()]);
  if (status.code !== 0) {
    throw new Error(decoder.decode(stderrOutput));
  }
  const denoInfo = JSON.parse(decoder.decode(output)) as DenoInfo;
  p.close();
  return denoInfo.modules.map((m) => m.specifier);
}

export async function getLocalDependencies(path: string): Promise<string[]> {
  return (await getDependencies(path)).filter((s) => s.startsWith("file:"));
}

export async function getLocalDependencyPaths(path: string): Promise<string[]> {
  return (await getLocalDependencies(path)).map(fromFileUrl);
}

type Dependency = {
  specifier: string;
  isDynamic: boolean;
  code: string;
};

type Module = {
  specifier: string;
  dependencies: Dependency[];
  size: number;
  mediaType: string;
  local: string;
  checksum: string;
  emit: string;
}

type DenoInfo = {
  root: string,
  modules: Module[],
  size: number,
}

/**
 * querySelectorAll wrapper
 */
export function* qs(doc: Document, query: string): Generator<Element, void, void> {
  for (const node of doc.querySelectorAll(query)) {
    // deno-lint-ignore no-explicit-any
    yield node as any as Element;
  }
}
