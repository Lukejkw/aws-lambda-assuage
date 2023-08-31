import { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler } from "./handler";

async function run(){
    const response = await handler({
        http: {
            method: 'GET'
        }
    } as unknown as APIGatewayProxyEventV2);
    console.log({ response })
}

run();