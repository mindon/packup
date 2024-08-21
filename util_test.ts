import { assertEquals, assertThrows } from "./test_deps.ts";
import { join } from "./deps.ts";
import {
  byteSize,
  checkUniqueEntrypoints,
  getDependencies,
  getLocalDependencies,
  getLocalDependencyPaths,
  md5,
} from "./util.ts";

const normalize = (p: string) => join(p);

Deno.test("md5 - returns md5 of the given data", () => {
  assertEquals(md5("a"), "0cc175b9c0f1b6a831c399e269772661");
  assertEquals(md5("b"), "92eb5ffee6ae2fec3ad71c777531578f");
  assertEquals(md5("c"), "4a8a08f09d37b73795649038408b5f33");
});

Deno.test("getDependencies - returns dependency specifiers", async () => {
  const cwd = Deno.cwd();
  assertEquals(
    (await getDependencies("testdata/foo.js")).map(normalize),
    [
      "file://" + join(cwd, "testdata/bar.js"),
      "file://" + join(cwd, "testdata/baz.js"),
      "file://" + join(cwd, "testdata/foo.js"),
      "https:/deno.land/std@0.210.0/assert/assert.ts",
      "https:/deno.land/std@0.210.0/assert/assertion_error.ts",
      "https:/deno.land/std@0.210.0/path/_common/assert_path.ts",
      "https:/deno.land/std@0.210.0/path/_common/basename.ts",
      "https:/deno.land/std@0.210.0/path/_common/common.ts",
      "https:/deno.land/std@0.210.0/path/_common/constants.ts",
      "https:/deno.land/std@0.210.0/path/_common/dirname.ts",
      "https:/deno.land/std@0.210.0/path/_common/format.ts",
      "https:/deno.land/std@0.210.0/path/_common/from_file_url.ts",
      "https:/deno.land/std@0.210.0/path/_common/glob_to_reg_exp.ts",
      "https:/deno.land/std@0.210.0/path/_common/normalize.ts",
      "https:/deno.land/std@0.210.0/path/_common/normalize_string.ts",
      "https:/deno.land/std@0.210.0/path/_common/relative.ts",
      "https:/deno.land/std@0.210.0/path/_common/strip_trailing_separators.ts",
      "https:/deno.land/std@0.210.0/path/_common/to_file_url.ts",
      "https:/deno.land/std@0.210.0/path/_interface.ts",
      "https:/deno.land/std@0.210.0/path/_os.ts",
      "https:/deno.land/std@0.210.0/path/basename.ts",
      "https:/deno.land/std@0.210.0/path/common.ts",
      "https:/deno.land/std@0.210.0/path/dirname.ts",
      "https:/deno.land/std@0.210.0/path/extname.ts",
      "https:/deno.land/std@0.210.0/path/format.ts",
      "https:/deno.land/std@0.210.0/path/from_file_url.ts",
      "https:/deno.land/std@0.210.0/path/glob_to_regexp.ts",
      "https:/deno.land/std@0.210.0/path/is_absolute.ts",
      "https:/deno.land/std@0.210.0/path/is_glob.ts",
      "https:/deno.land/std@0.210.0/path/join.ts",
      "https:/deno.land/std@0.210.0/path/join_globs.ts",
      "https:/deno.land/std@0.210.0/path/mod.ts",
      "https:/deno.land/std@0.210.0/path/normalize.ts",
      "https:/deno.land/std@0.210.0/path/normalize_glob.ts",
      "https:/deno.land/std@0.210.0/path/parse.ts",
      "https:/deno.land/std@0.210.0/path/posix/_util.ts",
      "https:/deno.land/std@0.210.0/path/posix/basename.ts",
      "https:/deno.land/std@0.210.0/path/posix/common.ts",
      "https:/deno.land/std@0.210.0/path/posix/dirname.ts",
      "https:/deno.land/std@0.210.0/path/posix/extname.ts",
      "https:/deno.land/std@0.210.0/path/posix/format.ts",
      "https:/deno.land/std@0.210.0/path/posix/from_file_url.ts",
      "https:/deno.land/std@0.210.0/path/posix/glob_to_regexp.ts",
      "https:/deno.land/std@0.210.0/path/posix/is_absolute.ts",
      "https:/deno.land/std@0.210.0/path/posix/is_glob.ts",
      "https:/deno.land/std@0.210.0/path/posix/join.ts",
      "https:/deno.land/std@0.210.0/path/posix/join_globs.ts",
      "https:/deno.land/std@0.210.0/path/posix/mod.ts",
      "https:/deno.land/std@0.210.0/path/posix/normalize.ts",
      "https:/deno.land/std@0.210.0/path/posix/normalize_glob.ts",
      "https:/deno.land/std@0.210.0/path/posix/parse.ts",
      "https:/deno.land/std@0.210.0/path/posix/relative.ts",
      "https:/deno.land/std@0.210.0/path/posix/resolve.ts",
      "https:/deno.land/std@0.210.0/path/posix/separator.ts",
      "https:/deno.land/std@0.210.0/path/posix/to_file_url.ts",
      "https:/deno.land/std@0.210.0/path/posix/to_namespaced_path.ts",
      "https:/deno.land/std@0.210.0/path/relative.ts",
      "https:/deno.land/std@0.210.0/path/resolve.ts",
      "https:/deno.land/std@0.210.0/path/separator.ts",
      "https:/deno.land/std@0.210.0/path/to_file_url.ts",
      "https:/deno.land/std@0.210.0/path/to_namespaced_path.ts",
      "https:/deno.land/std@0.210.0/path/windows/_util.ts",
      "https:/deno.land/std@0.210.0/path/windows/basename.ts",
      "https:/deno.land/std@0.210.0/path/windows/common.ts",
      "https:/deno.land/std@0.210.0/path/windows/dirname.ts",
      "https:/deno.land/std@0.210.0/path/windows/extname.ts",
      "https:/deno.land/std@0.210.0/path/windows/format.ts",
      "https:/deno.land/std@0.210.0/path/windows/from_file_url.ts",
      "https:/deno.land/std@0.210.0/path/windows/glob_to_regexp.ts",
      "https:/deno.land/std@0.210.0/path/windows/is_absolute.ts",
      "https:/deno.land/std@0.210.0/path/windows/is_glob.ts",
      "https:/deno.land/std@0.210.0/path/windows/join.ts",
      "https:/deno.land/std@0.210.0/path/windows/join_globs.ts",
      "https:/deno.land/std@0.210.0/path/windows/mod.ts",
      "https:/deno.land/std@0.210.0/path/windows/normalize.ts",
      "https:/deno.land/std@0.210.0/path/windows/normalize_glob.ts",
      "https:/deno.land/std@0.210.0/path/windows/parse.ts",
      "https:/deno.land/std@0.210.0/path/windows/relative.ts",
      "https:/deno.land/std@0.210.0/path/windows/resolve.ts",
      "https:/deno.land/std@0.210.0/path/windows/separator.ts",
      "https:/deno.land/std@0.210.0/path/windows/to_file_url.ts",
      "https:/deno.land/std@0.210.0/path/windows/to_namespaced_path.ts",
    ].map(normalize),
  );
});

Deno.test("getLocalDependencies - returns local dependency specifiers", async () => {
  const cwd = Deno.cwd();
  assertEquals(
    (await getLocalDependencies("testdata/foo.js")).map(normalize),
    [
      "file://" + join(cwd, "testdata/bar.js"),
      "file://" + join(cwd, "testdata/baz.js"),
      "file://" + join(cwd, "testdata/foo.js"),
    ].map(normalize),
  );
});

Deno.test("getLocalDependencyPaths - returns local dependency paths", async () => {
  const cwd = Deno.cwd();
  assertEquals(
    (await getLocalDependencyPaths("testdata/foo.js")).map(normalize),
    [
      join(cwd, "testdata/bar.js"),
      join(cwd, "testdata/baz.js"),
      join(cwd, "testdata/foo.js"),
    ].map(normalize),
  );
});

Deno.test("byteSize", () => {
  assertEquals(byteSize(345), `345B`);
  assertEquals(byteSize(1700), `1.66KB`);
  assertEquals(byteSize(1300000), `1.24MB`);
});

Deno.test("checkUniqueEntrypoints", () => {
  assertThrows(() => {
    checkUniqueEntrypoints(["index.html", "bar/index.html"]);
  });
  assertThrows(() => {
    checkUniqueEntrypoints(["foo/index.html", "bar/index.html"]);
  });
  checkUniqueEntrypoints(["index.html", "foo.html", "bar.html"]); // doesn't throw
});
