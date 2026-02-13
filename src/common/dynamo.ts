import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const ddb = new DynamoDBClient({});

export function requireEnv(name: string): string {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env var: ${name}`);
    return v;
}