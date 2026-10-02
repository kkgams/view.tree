import { runtime } from "/core/runtime.js"
import { registerViewPlugin, unregisterViewPlugin } from "/util/view-plugin.js"

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

export class ViewTreeParent extends HTMLElement {
  constructor() {
    super()
    this.formElement = null
    this.legendElement = null
    this.selectElement = null
    this.statusElement = null
    this.mode = "parent"
  }

  connectedCallback() {
    registerViewPlugin(this)
    if (this.dataset.ready) return
    this.dataset.ready = "1"
    this.style.display = "contents"
    this.innerHTML = `
      <form data-element="form" novalidate>
        <fieldset>
          <legend data-element="legend">Change Parent</legend>
          <label>
            Parent node
            <select data-field="parent"></select>
          </label>
        </fieldset>
        <footer>
          <output data-element="status"></output>
          <button type="button" data-action="cancel">Cancel</button>
          <button type="submit" data-action="save" class="accent">Apply</button>
        </footer>
      </form>
    `
    this.formElement = this.querySelector('[data-element="form"]')
    this.legendElement = this.querySelector('[data-element="legend"]')
    this.selectElement = this.querySelector('[data-field="parent"]')
    this.statusElement = this.querySelector('[data-element="status"]')
    assert(
      this.formElement instanceof HTMLFormElement,
      "view-tree-parent missing form",
    )
    assert(
      this.legendElement instanceof HTMLLegendElement,
      "view-tree-parent missing legend",
    )
    assert(
      this.selectElement instanceof HTMLSelectElement,
      "view-tree-parent missing parent select",
    )
    assert(
      this.statusElement instanceof HTMLOutputElement,
      "view-tree-parent missing status output",
    )

    this.querySelector('[data-action="cancel"]').addEventListener(
      "click",
      async () => {
        unwrap(
          await runtime.call("ui.popup.close", { ok: false, cancelled: true }),
        )
      },
    )
    this.formElement.addEventListener("submit", async (event) => {
      event.preventDefault()
      await this.save()
    })
    this.load()
  }

  load() {
    const props = this.popupProps || {}
    this.mode = String(props.mode || "parent")
    assert(
      this.mode === "parent" || this.mode === "create",
      `view-tree-parent unsupported mode ${this.mode}`,
    )
    const candidates = props.candidates
    assert(
      Array.isArray(candidates),
      "view-tree-parent requires candidates array",
    )
    this.legendElement.textContent =
      this.mode === "create" ? "Create Node" : "Change Parent"
    this.selectElement.replaceChildren()
    for (const candidate of candidates) {
      assert(
        Number.isInteger(candidate.index),
        "view-tree-parent candidate index must be integer",
      )
      assert(
        typeof candidate.label === "string",
        "view-tree-parent candidate label must be string",
      )
      const option = document.createElement("option")
      option.value = String(candidate.index)
      option.textContent = candidate.label
      if (candidate.index === props.currentParent) option.selected = true
      this.selectElement.appendChild(option)
    }
    this.statusElement.textContent =
      this.mode === "create"
        ? candidates.length > 0
          ? "Choose a parent for the new node. Edit node properties after creation to set name and other props."
          : "No parent candidates"
        : candidates.length > 0
          ? "Choose a new parent for the selected node"
          : "No valid parent candidates"
    this.statusElement.className = candidates.length > 0 ? "info" : "warning"
  }

  async save() {
    assert(
      this.selectElement.options.length > 0,
      "view-tree-parent requires at least one parent candidate",
    )
    const parentIndex = Number(this.selectElement.value)
    assert(
      Number.isInteger(parentIndex) && parentIndex >= 0,
      "view-tree-parent selected parent must be non-negative integer",
    )
    unwrap(
      await runtime.call("ui.popup.close", {
        ok: true,
        cancelled: false,
        parentIndex,
      }),
    )
  }

  disconnectedCallback() {
    void unregisterViewPlugin(this)
  }
}

if (!customElements.get("view-tree-parent")) {
  customElements.define("view-tree-parent", ViewTreeParent)
}
