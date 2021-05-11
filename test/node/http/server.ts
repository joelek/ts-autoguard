import * as libhttp from "http";
import * as libserver from "../schema/server";

libhttp.createServer({}, libserver.makeServer({
	"POST:/<component>/": async (request) => {
		let options = request.options();
		let headers = request.headers();
		let payload = await request.payload();
		console.log({ options, headers, payload });
		return {
			status: 299,
			headers: {
				header: "http header"
			},
			payload: {
				member: "http member"
			}
		}
	}
})).listen(80);
