import mongoose, { Schema } from "mongoose";

const BaseModelSchema = new Schema({
  key: { type: String, required: true },
  payload: { type: Object, required: true },
  expiresAt: { type: Date, required: true },
});

BaseModelSchema.index(
  { key: 1, "payload.kind": 1 },
  {
    unique: true,
  }
);

BaseModelSchema.index(
  { "payload.uid": 1 },
  {
    unique: true,
    partialFilterExpression: { "payload.kind": "Session" },
  }
);

BaseModelSchema.index(
  { "payload.grantId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "payload.kind": {
        $in: [
          "AccessToken",
          "AuthorizationCode",
          "RefreshToken",
          "DeviceCode",
          "BackchannelAuthenticationRequest",
        ],
      },
    },
  }
);

BaseModelSchema.index(
  { "payload.userCode": 1 },
  {
    unique: true,
    partialFilterExpression: { "payload.kind": "DeviceCode" },
  }
);

BaseModelSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
  }
);

export const BaseModel = mongoose.model<any>("BaseModel", BaseModelSchema);
