import * as libhttp from "http";
import * as libserver from "../schema/server";

libhttp.createServer({}, libserver.makeServer({
	plain: async (request) => {
		let options = request.options();
		let headers = request.headers();
		let payload = await request.payload();
		console.log("plain", { options, headers, payload });
		return {
			status: 204,
			headers: {
				ha: "1",
				hb: "2",
				hc: ["3", "4"],
				hd: ["5", "6"]
			}
		};
	},
	json: async (request) => {
		let options = request.options();
		let headers = request.headers();
		let payload = await request.payload();
		console.log("json", { options, headers, payload });
		return {
			status: 204,
			headers: {
				ha: 1,
				hb: 2,
				hc: [3, 4],
				hd: ["5", "6"]
			}
		};
	}
})).listen(80);
