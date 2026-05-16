const { Editor, EditSession, Document } = require("./load_ace.js")

class ServerEditor{
    constructor(){
        console.log("[SE] Creating new server editor...")
        this.editor = new Editor(global.renderer)
        this.document = new Document("")
        this.session = new EditSession(this.document)
        this.editor.setSession(this.session)
    }

    getDocument(){
        return this.document
    }

    setValue(textOrLines){
        this.editor.setValue(textOrLines)
    }

    getValue(){
        return this.session.getValue()
    }

    getSession(){
        return this.session
    }

    getEditor(){
        return this.editor
    }
}

class Cursor {
    constructor(clientId, position, id){
        this.clientId = clientId
        this.position = position
        this.id = id
    }

    setPosition(newPosition){
        this.position = newPosition
    }

    getPosition(){
        return this.position
    }
}

module.exports = { ServerEditor, Cursor }