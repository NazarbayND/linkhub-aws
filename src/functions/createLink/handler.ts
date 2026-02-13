import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { ddb, requireEnv } from "../../common/dynamo";
import { json } from "../../common/response";
import { randomCode } from "../../common/code";

type CreateLinkBody = {
    longUrl?: string;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        const tableName = requireEnv("LINKS_TABLE");
        const domain = event.requestContext.domainName; // e.g. abc123.execute-api.me-south-1.amazonaws.com
        const stage = event.requestContext.stage;       // usually "$default" for HTTP API default stage

        const baseUrl = stage === "$default"
            ? `https://${domain}`
            : `https://${domain}/${stage}`;

        const body: CreateLinkBody = event.body ? JSON.parse(event.body) : {};
        const longUrl = (body.longUrl || "").trim();

        if (!longUrl || !(longUrl.startsWith("http://") || longUrl.startsWith("https://"))) {
            return json(400, { message: "longUrl is required and must start with http:// or https://" });
        }

        // Try a few times in case of collision (conditional write)
        for (let attempt = 0; attempt < 5; attempt++) {
            const code = randomCode(7);
            const createdAt = Date.now();

            try {
                await ddb.send(
                    new PutItemCommand({
                        TableName: tableName,
                        Item: marshall({ code, longUrl, createdAt }),
                        ConditionExpression: "attribute_not_exists(#code)",
                        ExpressionAttributeNames: { "#code": "code" }
                    })
                );

                const shortUrl = `${baseUrl}/${code}`;
                return json(201, { code, shortUrl, longUrl, createdAt });
            } catch (err: any) {
                // ConditionalCheckFailedException => collision; retry
                if (err?.name === "ConditionalCheckFailedException") continue;
                throw err;
            }
        }

        return json(500, { message: "Failed to generate a unique code. Try again." });
    } catch (err: any) {
        console.error("createLink error:", err);
        return json(500, { message: "Internal error" });
    }
};