import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('✅ Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('❌ Client disconnected:', client.id);
  }

  // ✅ broadcast: new message created
  emitNewMessage(payload: any) {
    this.server.emit('message:new', payload);
  }

  // ✅ broadcast: message updated (status/content)
  emitUpdatedMessage(payload: any) {
    this.server.emit('message:updated', payload);
  }

  // ✅ broadcast: message deleted
  emitDeletedMessage(id: string) {
    this.server.emit('message:deleted', { id });
  }
  emitMessageUpdated(payload: any) {
  this.server.emit('message:updated', payload);
}

emitMessageDeleted(payload: { id: string }) {
  this.server.emit('message:deleted', payload);
}

}
