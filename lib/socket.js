
"use strict";
const compose = require('koa-compose');

/**
 * @class
 */
module.exports = class Socket {
  /**
   * Socket constructor.
   * Called when a socket gets connected and attaches any listeners and middleware to the event chain.
   * @param socket <Socket.io Socket>}
   * @param listeners <Map> list of events and handlers
   * @param middleware <Function> composed middleware function
   */
  constructor( socket, listeners, middleware ) {
    this.socket = socket;

    // The composed middleware function
    this.middleware = null;

    // Append listeners and composed middleware function
    this.update( listeners, middleware );
  }

  /**
   * Adds a specific event and callback to this socket
   * @param event <String>
   * @param data <?>
   */
  on( event, handler ) {
      let handlers;
      if (this.middleware) {
        handlers = compose([
          this.middleware,
          async (packet) => {
            await handler(packet, packet.data);
          }
        ]);
      }
      this.socket.on( event, ( data, cb ) => {
      let packet = {
        event: event,
        data: data,
        socket: this,
        acknowledge: cb
      };

      if ( !this.middleware ) {
        handler( packet, data );
        return;
      }
      handlers( packet );
      /*
      this.middleware( packet )
        .then( () => {
          handler( packet, data );
        });
        */
    });
  }

  /**
   * Registers the new list of listeners and middleware composition
   * @param listeners <Map> map of events and callbacks
   * @param middleware <Function> the composed middleware
   */
  update( listeners, middleware ) {
    this.socket.removeAllListeners();
    this.middleware = middleware;

    listeners.forEach( ( handlers, event ) => {
      if ( event === 'connection' ) {
        return;
      }

      handlers.forEach( handler => {
        this.on( event, handler );
      });
    })
  }

  /**
   * Getter for the socket id
   * @type <String>
   */
  get id() {
    return this.socket.id;
  }

  /**
   * Helper through to the socket
   * @param event <String>
   * @param packet <Object>
   * @param ack <Callback>
   */
  emit( event, packet, ack ) {
    this.socket.emit( event, packet, ack );
  }

  /**
   * Helper through to broadcasting
   */
  get broadcast() {
    return this.socket.broadcast;
  }

  /**
   * Helper through to join
   */
  join(room) {
    return this.socket.join(room);
  }

  /**
   * Helper through to leave
   */
  leave(room) {
    return this.socket.leave(room);
  }

  /**
   * Helper through to room list
   */
  get rooms() {
    return this.socket.rooms;
  }

  /**
   * Helper through to volatile
   */
  get volatile() {
    return this.socket.volatile;
  }

  /**
   * Helper through to compress
   * @param compress <Boolean>
   */
  compress( compress ) {
    return this.socket.compress(compress);
  }

  /**
   * Disconnect helper
   */
  disconnect() {
    this.socket.disconnect();
  }
}
