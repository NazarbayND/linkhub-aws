import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ddb, requireEnv } from "../../common/dynamo";
import { json, redirect302 } from "../../common/response";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        const tableName = requireEnv("LINKS_TABLE");
        const code = event.pathParameters?.code;

        if (!code) return json(400, { message: "Missing code" });

        const res = await ddb.send(
            new GetItemCommand({
                TableName: tableName,
                Key: { code: { S: code } }
            })
        );

        if (!res.Item) return json(404, { message: "Not found" });

        const item = unmarshall(res.Item) as { longUrl?: string };
        if (!item.longUrl) return json(500, { message: "Corrupt record" });

        return redirect302(item.longUrl);
    } catch (err: any) {
        console.error("redirect error:", err);
        return json(500, { message: "Internal error" });
    }
};