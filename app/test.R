library(websocket)
library(jsonlite)

ws <- WebSocket$new("wss://crdt-server.onrender.com/", 
                    autoConnect = FALSE)

joinJSON <- function(docId = "file-1"){
  list(type = "join", docId = docId)
}

updateJSON <- function(msg, docId = "file-1"){
  raw_data <- charToRaw(msg)
  list(type = "update",
       docId = docId,
       update = as.list(as.integer(raw_data)))
}

ws$onOpen(function(event) {
  cat("Connection opened\n")
  
  msg <- toJSON(joinJSON("file-1"), auto_unbox = TRUE)
  # msg <- toJSON(list(
  #   type = "join",
  #   docId = "file-1"
  # ), auto_unbox = TRUE)
  
  ws$send(msg)
})

send <- function(ws, json){
  ws$send(toJSON(json, auto_unbox = TRUE))
}

ws$onMessage(function(event) {
  msg <- fromJSON(event$data)
  print(msg)
})