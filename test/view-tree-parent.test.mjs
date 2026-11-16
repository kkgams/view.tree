import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import vm from "node:vm"

const filename = new URL("../src/view.tree-parent/views/view-tree-parent.js", import.meta.url)
const source = readFileSync(filename, "utf8")

function parentPicker(result = { ok: null }) {
  const calls = []
  const modules = {
    "/core/runtime.js": {
      runtime: {
        async call(...args) {
          calls.push(args)
          return result
        },
      },
      unwrap(result, label = "unknown") {
        if (result && Object.hasOwn(result, "ok")) return result.ok
        if (result && Object.hasOwn(result, "err")) throw new Error(`${label}: ${result.err}`)
        throw new Error(`${label}: expected WIT result object`)
      },
    },
    "/util/view-plugin.js": {
      registerViewPlugin() {},
      unregisterViewPlugin() {},
    },
  }
  // Bind only the names actually imported by the View: a missing unwrap stays missing.
  const script = source
    .replace(/import\s*\{([^}]+)\}\s*from\s*"([^"]+)"/g,
      (_, names, path) => `const {${names}} = modules[${JSON.stringify(path)}]`)
    .replace("export class ViewTreeParent", "class ViewTreeParent")
  const ViewTreeParent = vm.runInNewContext(`${script}\nViewTreeParent`, {
    modules,
    HTMLElement: class {},
    customElements: { get() { return true } },
  }, { filename: filename.pathname })
  const view = new ViewTreeParent()
  view.selectElement = { options: [{}, {}], value: "7" }
  return { view, calls }
}

test("save closes the popup with the selected numeric parent", async () => {
  const { view, calls } = parentPicker()
  await view.save()
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ["ui.popup.close", { ok: true, cancelled: false, parentIndex: 7 }],
  ])
})

test("save propagates a guest popup-close failure", async () => {
  const { view, calls } = parentPicker({ err: "popup close failed" })
  await assert.rejects(view.save(), /unknown: popup close failed/)
  assert.equal(calls.length, 1)
})

test("save guards prevent closing without a valid parent selection", async (t) => {
  for (const [name, options, value, message] of [
    ["no candidates", [], "0", /requires at least one parent candidate/],
    ["negative index", [{}], "-1", /selected parent must be non-negative integer/],
    ["fractional index", [{}], "1.5", /selected parent must be non-negative integer/],
    ["non-numeric index", [{}], "invalid", /selected parent must be non-negative integer/],
  ]) {
    await t.test(name, async () => {
      const { view, calls } = parentPicker()
      view.selectElement = { options, value }
      await assert.rejects(view.save(), message)
      assert.equal(calls.length, 0)
    })
  }
})
