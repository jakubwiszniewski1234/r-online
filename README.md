# R Online
## About project
This repository is a monorepo of a RStudio (partial) extension, allowing multiple users to edit multiple files **IN REAL-TIME** in RStudio IDE on their own clients.

"R Online", as what my friends called it, was created for my University classes and was sometimes used in group projects when testing Probabilistic Regression Models.

This project is likely graveyarded due to more ambitious project of my own (for now at least). I do not know about legality of this project, since RStudio creators offer their cloud service on their website. 

## How it works
It is a simple RStudio client Web Socket extension that connects to the Web Socket Server. 

The client can open or join a "room" for editing a specific document, download the current state of document from the server and input changes to it, synchronizing them for all users that are currently connected. 

On the server an ACE Editor is created (similar to the RStudio IDE, since it uses same framework), handling the changes and conflicts on its side and sending output changes to all the users.

It is also a feature to see every connected user cursor position in real-time.

## How to mount for your website
You need to deploy a server with config online (e.g. on Render).

Then, once a server is running, you can open a static HTML and follow the steps. It allows you to download client-side code from the website through the DevTools console.

You can alternatively paste client.js file from **app** folder to IDE's DevTools directly.

**Important:** RStudio IDEs usually allow using DevTools (through clicking F12 or right-clicked + Inspect), although this could not work *(my friend with Fedora couldn't join to a room)*.

## Conclusions
Feel free to fork this project and use it (if you do, please give me a star <3)

It has some errors and can be (should be) highly improved.
