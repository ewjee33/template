import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document<unknown, {}, User>;

@Schema()
export class User  {
  @Prop({required: true})
  userId: string;

  @Prop({required: true})
  password: string;

  @Prop({required: true , default : new Date()})
  created: Date;
  
  @Prop({required: true , default : new Date()})
  signedIn: Date;

  @Prop({required: true})
  consumerId: string;

  @Prop({required: true})
  keyId: string;

  @Prop()
  isCheater: boolean;

  @Prop({required: true , default : false})
  deleted: boolean;

  constructor(
    userId: string,
    password: string,
    consumerId: string,
    keyId: string,
    isCheater: boolean = false,
    deleted: boolean = false
  ) {
    this.userId = userId;
    this.password = password;
    this.created = new Date();
    this.signedIn = new Date(); // Assuming 'signedIn' is set to now upon creation
    this.consumerId = consumerId;
    this.keyId = keyId;
    this.isCheater = isCheater;
    this.deleted = deleted;
  }
}
export const UserSchema = SchemaFactory.createForClass(User);
