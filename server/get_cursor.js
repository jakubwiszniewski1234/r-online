var allEditors = document.querySelectorAll(".ace_editor")

for (var i = 0; i < allEditors.length; i++){
    el = allEditors[i]
    console.log(el)
    if (el.id.includes("rstudio_source_text_editor")){
        if (el.checkVisibility() == true){
            var editor_element = ace.edit(el)
            break
        }
    }
}

const editor = editor_element

const Range = ace.require("ace/range").Range;

const style = document.createElement("style");

style.textContent = `
  .ace_cursor_modifier {
}
`

document.head.appendChild(style);

editor.session.addMarker(
  new Range(0, 0, 0, 0.01),
  "ace_cursor ace_cursor_modifier",
  "text",
  false
)

