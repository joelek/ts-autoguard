import * as autoguard from "../../../build/autoguard-lib";
import * as libclient from "../schema/client";

const client = libclient.makeClient({
	urlPrefix: "https://localhost",
	requestHandler: autoguard.api.makeNodeRequestHandler({
		rejectUnauthorized: false
	})
});

const response = client["POST:/<component>/"]({
	options: {
		component: "request component",
		parameter: "request parameter"
	},
	headers: {
		header: "request header"
	},
	payload: {
		member: "request member"
	}
});

response.then(console.log);
response.catch(console.log);
