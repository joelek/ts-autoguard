import * as autoguard from "../../../dist/lib-server"
import * as libclient from "../schema/client";

const client = libclient.makeClient({
	urlPrefix: "http://localhost",
	requestHandler: autoguard.api.makeNodeRequestHandler()
});

(async () => {
	let response = await client.plain({
		options: {
			ca: "1",
			cb: "2",
			cc: ["3", "4"],
			pa: "1",
			pb: "2",
			pc: ["3", "4"],
			pd: ["5", "6"]
		},
		headers: {
			ha: "1",
			hb: "2",
			hc: ["3", "4"],
			hd: ["5", "6"]
		}
	});
	let headers = response.headers();
	let payload = await response.payload();
	console.log("plain", { headers, payload });
})();

(async () => {
	let response = await client.json({
		options: {
			ca: 1,
			cb: 2,
			cc: [3, 4],
			pa: 1,
			pb: 2,
			pc: [3, 4],
			pd: ["5", "6"]
		},
		headers: {
			ha: 1,
			hb: 2,
			hc: [3, 4],
			hd: ["5", "6"]
		}
	});
	let headers = response.headers();
	let payload = await response.payload();
	console.log("json", { headers, payload });
})();
