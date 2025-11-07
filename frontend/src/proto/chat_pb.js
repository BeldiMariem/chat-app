// ES Module version of chat_pb.js
import * as jspb from 'google-protobuf';

export class MessageRequest {
  constructor(opt_data) {
    jspb.Message.initialize(this, opt_data, 0, -1, null, null);
  }

  toObject(opt_includeInstance) {
    return MessageRequest.toObject(opt_includeInstance, this);
  }

  static toObject(includeInstance, msg) {
    var f, obj = {
      userId: jspb.Message.getFieldWithDefault(msg, 1, ""),
      content: jspb.Message.getFieldWithDefault(msg, 2, ""),
      roomId: jspb.Message.getFieldWithDefault(msg, 3, "")
    };

    if (includeInstance) {
      obj.$jspbMessageInstance = msg;
    }
    return obj;
  }

  static deserializeBinary(bytes) {
    var reader = new jspb.BinaryReader(bytes);
    var msg = new MessageRequest;
    return MessageRequest.deserializeBinaryFromReader(msg, reader);
  }

  static deserializeBinaryFromReader(msg, reader) {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      var field = reader.getFieldNumber();
      switch (field) {
        case 1:
          var value = reader.readString();
          msg.setUserId(value);
          break;
        case 2:
          var value = reader.readString();
          msg.setContent(value);
          break;
        case 3:
          var value = reader.readString();
          msg.setRoomId(value);
          break;
        default:
          reader.skipField();
          break;
      }
    }
    return msg;
  }

  serializeBinary() {
    var writer = new jspb.BinaryWriter();
    MessageRequest.serializeBinaryToWriter(this, writer);
    return writer.getResultBuffer();
  }

  static serializeBinaryToWriter(message, writer) {
    var f = undefined;
    f = message.getUserId();
    if (f.length > 0) {
      writer.writeString(1, f);
    }
    f = message.getContent();
    if (f.length > 0) {
      writer.writeString(2, f);
    }
    f = message.getRoomId();
    if (f.length > 0) {
      writer.writeString(3, f);
    }
  }

  getUserId() {
    return jspb.Message.getFieldWithDefault(this, 1, "");
  }

  setUserId(value) {
    return jspb.Message.setProto3StringField(this, 1, value);
  }

  getContent() {
    return jspb.Message.getFieldWithDefault(this, 2, "");
  }

  setContent(value) {
    return jspb.Message.setProto3StringField(this, 2, value);
  }

  getRoomId() {
    return jspb.Message.getFieldWithDefault(this, 3, "");
  }

  setRoomId(value) {
    return jspb.Message.setProto3StringField(this, 3, value);
  }
}

export class MessageResponse {
  constructor(opt_data) {
    jspb.Message.initialize(this, opt_data, 0, -1, null, null);
  }

  toObject(opt_includeInstance) {
    return MessageResponse.toObject(opt_includeInstance, this);
  }

  static toObject(includeInstance, msg) {
    var f, obj = {
      messageId: jspb.Message.getFieldWithDefault(msg, 1, ""),
      userId: jspb.Message.getFieldWithDefault(msg, 2, ""),
      content: jspb.Message.getFieldWithDefault(msg, 3, ""),
      timestamp: jspb.Message.getFieldWithDefault(msg, 4, ""),
      roomId: jspb.Message.getFieldWithDefault(msg, 5, "")
    };

    if (includeInstance) {
      obj.$jspbMessageInstance = msg;
    }
    return obj;
  }

  static deserializeBinary(bytes) {
    var reader = new jspb.BinaryReader(bytes);
    var msg = new MessageResponse;
    return MessageResponse.deserializeBinaryFromReader(msg, reader);
  }

  static deserializeBinaryFromReader(msg, reader) {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      var field = reader.getFieldNumber();
      switch (field) {
        case 1:
          var value = reader.readString();
          msg.setMessageId(value);
          break;
        case 2:
          var value = reader.readString();
          msg.setUserId(value);
          break;
        case 3:
          var value = reader.readString();
          msg.setContent(value);
          break;
        case 4:
          var value = reader.readString();
          msg.setTimestamp(value);
          break;
        case 5:
          var value = reader.readString();
          msg.setRoomId(value);
          break;
        default:
          reader.skipField();
          break;
      }
    }
    return msg;
  }

  serializeBinary() {
    var writer = new jspb.BinaryWriter();
    MessageResponse.serializeBinaryToWriter(this, writer);
    return writer.getResultBuffer();
  }

  static serializeBinaryToWriter(message, writer) {
    var f = undefined;
    f = message.getMessageId();
    if (f.length > 0) {
      writer.writeString(1, f);
    }
    f = message.getUserId();
    if (f.length > 0) {
      writer.writeString(2, f);
    }
    f = message.getContent();
    if (f.length > 0) {
      writer.writeString(3, f);
    }
    f = message.getTimestamp();
    if (f.length > 0) {
      writer.writeString(4, f);
    }
    f = message.getRoomId();
    if (f.length > 0) {
      writer.writeString(5, f);
    }
  }

  getMessageId() {
    return jspb.Message.getFieldWithDefault(this, 1, "");
  }

  setMessageId(value) {
    return jspb.Message.setProto3StringField(this, 1, value);
  }

  getUserId() {
    return jspb.Message.getFieldWithDefault(this, 2, "");
  }

  setUserId(value) {
    return jspb.Message.setProto3StringField(this, 2, value);
  }

  getContent() {
    return jspb.Message.getFieldWithDefault(this, 3, "");
  }

  setContent(value) {
    return jspb.Message.setProto3StringField(this, 3, value);
  }

  getTimestamp() {
    return jspb.Message.getFieldWithDefault(this, 4, "");
  }

  setTimestamp(value) {
    return jspb.Message.setProto3StringField(this, 4, value);
  }

  getRoomId() {
    return jspb.Message.getFieldWithDefault(this, 5, "");
  }

  setRoomId(value) {
    return jspb.Message.setProto3StringField(this, 5, value);
  }
}

export class StreamRequest {
  constructor(opt_data) {
    jspb.Message.initialize(this, opt_data, 0, -1, null, null);
  }

  toObject(opt_includeInstance) {
    return StreamRequest.toObject(opt_includeInstance, this);
  }

  static toObject(includeInstance, msg) {
    var f, obj = {
      roomId: jspb.Message.getFieldWithDefault(msg, 1, "")
    };

    if (includeInstance) {
      obj.$jspbMessageInstance = msg;
    }
    return obj;
  }

  static deserializeBinary(bytes) {
    var reader = new jspb.BinaryReader(bytes);
    var msg = new StreamRequest;
    return StreamRequest.deserializeBinaryFromReader(msg, reader);
  }

  static deserializeBinaryFromReader(msg, reader) {
    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }
      var field = reader.getFieldNumber();
      switch (field) {
        case 1:
          var value = reader.readString();
          msg.setRoomId(value);
          break;
        default:
          reader.skipField();
          break;
      }
    }
    return msg;
  }

  serializeBinary() {
    var writer = new jspb.BinaryWriter();
    StreamRequest.serializeBinaryToWriter(this, writer);
    return writer.getResultBuffer();
  }

  static serializeBinaryToWriter(message, writer) {
    var f = undefined;
    f = message.getRoomId();
    if (f.length > 0) {
      writer.writeString(1, f);
    }
  }

  getRoomId() {
    return jspb.Message.getFieldWithDefault(this, 1, "");
  }

  setRoomId(value) {
    return jspb.Message.setProto3StringField(this, 1, value);
  }
}