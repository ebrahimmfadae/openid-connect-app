import { BaseModel } from "../db/mongodb/models/BaseModel";

export class MongoDbAdapter {
  model: string;

  /**
   *
   * Creates an instance of MemoryAdapter for an oidc-provider model.
   *
   * @constructor
   * @param {string} name Name of the oidc-provider model. One of "Grant, "Session", "AccessToken",
   * "AuthorizationCode", "RefreshToken", "ClientCredentials", "Client", "InitialAccessToken",
   * "RegistrationAccessToken", "DeviceCode", "Interaction", "ReplayDetection",
   * "BackchannelAuthenticationRequest", or "PushedAuthorizationRequest"
   *
   */
  constructor(name: string) {
    // console.log(`MemoryAdapter(${name})`);
    this.model = name;
  }

  /**
   *
   * Update or Create an instance of an oidc-provider model.
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} id Identifier that oidc-provider will use to reference this model instance for
   * future operations.
   * @param {object} payload Object with all properties intended for storage.
   * @param {number} expiresIn Number of seconds intended for this model to be stored.
   *
   */
  async upsert(id: string, payload: any, expiresIn: number): Promise<any> {
    return await BaseModel.updateOne(
      {
        key: id,
      },
      { payload, expiresAt: new Date(Date.now() + expiresIn * 1000) },
      { upsert: true }
    );
  }

  /**
   *
   * Return previously stored instance of an oidc-provider model.
   *
   * @return {Promise} Promise fulfilled with what was previously stored for the id (when found and
   * not dropped yet due to expiration) or falsy value when not found anymore. Rejected with error
   * when encountered.
   * @param {string} id Identifier of oidc-provider model
   *
   */
  async find(id: string): Promise<any> {
    const doc: any = await BaseModel.findOne({
      key: id,
      "payload.kind": this.model,
    });
    return doc?.payload;
  }

  /**
   *
   * Return previously stored instance of DeviceCode by the end-user entered user code. You only
   * need this method for the deviceFlow feature
   *
   * @return {Promise} Promise fulfilled with the stored device code object (when found and not
   * dropped yet due to expiration) or falsy value when not found anymore. Rejected with error
   * when encountered.
   * @param {string} userCode the user_code value associated with a DeviceCode instance
   *
   */
  async findByUserCode(userCode: string): Promise<any> {
    const doc: any = await BaseModel.findOne({
      "payload.kind": "DeviceCode",
      "payload.userCode": userCode,
    });
    return doc?.payload;
  }

  /**
   *
   * Return previously stored instance of Session by its uid reference property.
   *
   * @return {Promise} Promise fulfilled with the stored session object (when found and not
   * dropped yet due to expiration) or falsy value when not found anymore. Rejected with error
   * when encountered.
   * @param {string} uid the uid value associated with a Session instance
   *
   */
  async findByUid(uid: string): Promise<any> {
    const doc: any = await BaseModel.findOne({
      "payload.kind": "Session",
      "payload.uid": uid,
    });
    return doc?.payload;
  }

  /**
   *
   * Mark a stored oidc-provider model as consumed (not yet expired though!). Future finds for this
   * id should be fulfilled with an object containing additional property named "consumed" with a
   * truthy value (timestamp, date, boolean, etc).
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} id Identifier of oidc-provider model
   *
   */
  async consume(id: string): Promise<any> {
    return BaseModel.updateOne(
      {
        key: id,
        "payload.kind": this.model,
      },
      { consumed: Date.now() / 1000 }
    );
  }

  /**
   *
   * Destroy/Drop/Remove a stored oidc-provider model. Future finds for this id should be fulfilled
   * with falsy values.
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} id Identifier of oidc-provider model
   *
   */
  async destroy(id: string): Promise<any> {
    return BaseModel.deleteOne({
      key: id,
      "payload.kind": this.model,
    });
  }

  /**
   *
   * Destroy/Drop/Remove a stored oidc-provider model by its grantId property reference. Future
   * finds for all tokens having this grantId value should be fulfilled with falsy values.
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} grantId the grantId value associated with a this model's instance
   *
   */
  async revokeByGrantId(grantId: string): Promise<any> {
    return BaseModel.deleteMany({
      "payload.grantId": grantId,
    });
  }
}
