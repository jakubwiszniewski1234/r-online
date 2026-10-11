function getCurrentSourceEditor(){
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

    return editor_element
}


module.exports = { getCurrentSourceEditor }