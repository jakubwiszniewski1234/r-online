const ace_modules_folder = "./ace_modules"
require(ace_modules_folder + "/test/mockdom")

const MockRenderer = require(ace_modules_folder + "/test/mockrenderer").MockRenderer
const Editor = require(ace_modules_folder + "/editor").Editor
const EditSession = require(ace_modules_folder + "/edit_session").EditSession
const Document = require(ace_modules_folder + "/document").Document

global.renderer = new MockRenderer()
global.ace = require(ace_modules_folder + "/ace.js")

module.exports = { MockRenderer, Editor, EditSession, Document }