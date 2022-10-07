import { Account } from "../db/mongodb/models/Account"

export const get = async (key: string) => await Account.findOne({ username: key });
export const set = async (key: string, value: any) => await Account.insertMany(value);