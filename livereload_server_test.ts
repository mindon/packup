import { livereloadServer } from "./livereload_server.ts";
import { assert, assertEquals, assertStringIncludes } from "./test_deps.ts";

Deno.test("livereloadServer", async () => {
  const port = 34567;
  const eventtarget = new EventTarget();
  const server = livereloadServer(port, eventtarget);
  try {
    const wsURL = `ws://localhost:${port}`;

    // Livereload server should serve livereload.js
    const res = await fetch(`http://localhost:${port}/livereload.js`);
    const text = await res.text();
    assertStringIncludes(text, `new WebSocket("${wsURL}/livereload")`);

    // Livereload server should accept websocket requests
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    const done = promise;
    let receivedMessage: string | undefined;
    const ws = new WebSocket(`${wsURL}/livereload`);
    // Livereload server automatically closes a websocket connection when 'built' event is dispatched
    ws.onclose = () => resolve();
    ws.onopen = async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      eventtarget.dispatchEvent(new Event("built"));
    };
    ws.onmessage = (ev: MessageEvent<string>) => {
      receivedMessage = ev.data;
    };
    ws.onerror = (ev) => reject(ev);

    await done;
    assert(receivedMessage);
    assertEquals(JSON.parse(receivedMessage), { type: "reload" });
  } finally {
    await server.close();
  }
});
