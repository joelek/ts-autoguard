import * as autoguard from "../../../build/autoguard-lib";
import * as libclient from "../schema/client";

const client = libclient.makeClient({
	urlPrefix: "https://localhost",
	requestHandler: autoguard.api.makeNodeRequestHandler({
		rejectUnauthorized: false
	})
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
