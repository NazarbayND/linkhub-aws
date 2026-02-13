import type { APIGatewayProxyResultV2 } from "aws-lambda";

export function json(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
    return {
        statusCode,
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(body)
    };
}

export function redirect302(location: string): APIGatewayProxyResultV2 {
    return {
        statusCode: 302,
        headers: {
            Location: location
        },
        body: ""
    };
}