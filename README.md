# AtelierServer

## Project Structure

This project is split into 3 main parts: logic (`src/dnd`, and `src/lib`), web server (`src/server`), content (`impl`).

### Logic

Several utility files are located under `src/lib`. This contains tools for serialization and event handling using decorators. These are used in `src/dnd` to model objects in a DND game.

### Server

A rudimentary file database, Rest API, and websocket endpoint is located under `src/server`. The latter two are consumed by a client package [AtelierClient](https://github.com/Rithsagea/AtelierClient)

### Content

Any implementations of game objects will fall under `content`. This is dynamically loaded at runtime.
