import * as libhttps from "https";
import * as libserver from "../schema/server";

const selfSignedCertificate = `
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIUUUp+q0/xVwMKmhwxp8wQkJ4HTDcwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yMDEyMDYyMTIwMTRaFw0yMTEy
MDYyMTIwMTRaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggIiMA0GCSqGSIb3DQEB
AQUAA4ICDwAwggIKAoICAQC3CFQ3+56QMKBQdBi6q4MHMI8cq98maLehQh2pixGb
NpbXOpeCeQxxFSW8lYv60etHNhXuAtjIj+iezK2FqmQCDid0iy4/uQtRB+vQZGM8
91zJ+4jWlkWhsHWjwCNoSfJrf2elbsNzIoUOw0v6TKxJOzslFkhFM7uHUCTFkeTH
kzMUrVuf8UejRkJO7IJqX9Xsa0iQvOz8jeHm7lSsAPc8qqYgGB6jT/Ouws1RLbfd
mzu0BqlqUhi5IheyjebovlA6SoGaCqDu+zhSTtJ9zH5NsTf7z/Amt922zuR1i+fs
1+0CceaJuMCdw11nursEdnTaUqw1O2nzCsmB9AZNGPlW+yKwx4N46MSijiE4zU74
LPmI0h3JDrhQ4HCl6Hxh1vRGIxBiPeEZBICGcmS7obsOonF/j6JZ48t+eNINIs/F
EnV3I+d6VW3AY0IfpJvcGxr7/khmumFbyLpYy7cP/E4nojwAy2/hweaOKi7OuVau
wMnPpCbfAsvpTORiLBbP8uQoiCL0hve6ifKiNlQ3hUZfqKSLMOT2ceMN6QOHombW
ABOZTS1Vz56aWVTRYdmgsdNPavtqlrGWFL0gsP+0mEQUsN6YuBuzZiT9kOIRAPf8
XW9818vTBZny2eDm2HNuH94d57nqFRHC8V6Ngh8CgMgEHu/SY5xw5lReWhl4292x
cQIDAQABo1MwUTAdBgNVHQ4EFgQUranRZuMNVxqQh6+xw1jpDWTbsCUwHwYDVR0j
BBgwFoAUranRZuMNVxqQh6+xw1jpDWTbsCUwDwYDVR0TAQH/BAUwAwEB/zANBgkq
hkiG9w0BAQsFAAOCAgEAieeiqnSQFnBkR2p+7pPX3MS5sOyAhFyD34AGYj5d8dWc
DFIvfseNiqRzt2O94sDB5YqQ61fBq7WHvkWpxBAW7hQ4uOkb2eKQbLlLCsoGgdcF
taUgukilbh52B/dvGOU7Qlntibu43XOtJ/nT/KctQCa28G3c5wswskK+IUN7qqfF
QSjP7MODoUO7m/Uw+QZ1Gzr6cHtYRDRmRG4IRCcKbD3+/cibgUAO2OyJNK8B3Wi1
lME0hrBH5c7gXPdwcQZ68dNyLPkIUhTPjmVdplaf0qX/wMAp0iLxgMelWi0eaQpQ
Pgg9uEpWLxEZOML/Tz2f01D0tCFRcobqHaAGMoUns84WIpfwB2VOtGuVXU0YCOW8
FZOdQAiRGRTbYLqOcIejlUU6em0E641ElgOYdmsnGWQye84RLNuF1QgIqQWlrdFc
bMbvQX98VOR+ZF+k9VskAZHHihpBgVc+LagG6kmPeF+q7xzjlIR1ELaIKoQLa9Vt
Hmuv9QkinGLjYW4Rm1fPlBYCTHLGMESvi2AnseHK6oUqJgd/DNFANX4JG1EYcV6p
nNJWC1DYMYoqDRvPje3D/RPC7VPQgF1WGg8zFyH4BEDzG2LcbPmQ0pBnifX1db/j
KqvstQQGIN9o0hxUk1GNMrA6YdIiTl/r1yhRjkN4ZvYw9BuXINF0nIHXUnkEacs=
-----END CERTIFICATE-----
`;

const selfSignedPrivateKey = `
-----BEGIN PRIVATE KEY-----
MIIJQwIBADANBgkqhkiG9w0BAQEFAASCCS0wggkpAgEAAoICAQC3CFQ3+56QMKBQ
dBi6q4MHMI8cq98maLehQh2pixGbNpbXOpeCeQxxFSW8lYv60etHNhXuAtjIj+ie
zK2FqmQCDid0iy4/uQtRB+vQZGM891zJ+4jWlkWhsHWjwCNoSfJrf2elbsNzIoUO
w0v6TKxJOzslFkhFM7uHUCTFkeTHkzMUrVuf8UejRkJO7IJqX9Xsa0iQvOz8jeHm
7lSsAPc8qqYgGB6jT/Ouws1RLbfdmzu0BqlqUhi5IheyjebovlA6SoGaCqDu+zhS
TtJ9zH5NsTf7z/Amt922zuR1i+fs1+0CceaJuMCdw11nursEdnTaUqw1O2nzCsmB
9AZNGPlW+yKwx4N46MSijiE4zU74LPmI0h3JDrhQ4HCl6Hxh1vRGIxBiPeEZBICG
cmS7obsOonF/j6JZ48t+eNINIs/FEnV3I+d6VW3AY0IfpJvcGxr7/khmumFbyLpY
y7cP/E4nojwAy2/hweaOKi7OuVauwMnPpCbfAsvpTORiLBbP8uQoiCL0hve6ifKi
NlQ3hUZfqKSLMOT2ceMN6QOHombWABOZTS1Vz56aWVTRYdmgsdNPavtqlrGWFL0g
sP+0mEQUsN6YuBuzZiT9kOIRAPf8XW9818vTBZny2eDm2HNuH94d57nqFRHC8V6N
gh8CgMgEHu/SY5xw5lReWhl4292xcQIDAQABAoICAQCcyGur0MOQa7bHc8tDC2uf
mv7b5nWt5wF1Brd15YRdWjN3hd8Gij4YF69NjSRs46gQRcofKR0dH/h5HoZ8+unT
wOAXOqmROCbzcD+VMIi5ToKTGf2rIuneiNMcQ5eQ29bmMipMUUbmtukXLj9E1qy1
xiDxsdaSQLAgRoxZGJHKStL0oVLc/McKm0JtbLaB/Dm43GU6ZjryU27wa7Ln66Pc
uai30TFdXz0zs/Y/1VOsZi6MFTDFvDElVIjMEDV9pJgAdpXxp60XSOaDyrUPwT1n
u6hi8UmbQOCQmUSlVASEoqmI8Jwz2KhV+2VlV1SfjACoiyysJIqq/9CAmtFS9VOO
s12M5kUYw7DFtLgQ4QJZrKO6v9OOpl0P2XA9raD0td2KHbkmkhg3BdqsUdrbPKID
UpDe0iTJrgdP/RLVMIdnO6f/bYQg0RNKb6ilsn9XoGi5OrXAon/Wa6SJgzzpevqu
gYP/e7TnPxn08DzhC+AlLFwpD+jkHmwet3vVUFHUOiaXh7M+S6aAVzhlwlCuQoWm
UdopF4j+/DHQV7GWgoQ06kV0wIiW+jroDRYxFtLHPJy8+SsRV65Tbm38kVBCSAP6
bZR0R6mvIlYObajcLJRMHSIWRoECCMwNiV5TGTbpntJ442pcptuCLEyyzJSf2Kx8
d80FRW8FGew10wUaRM4Z6QKCAQEA8XLjffiodjMkn8JyaFxh0p3h4CGmGAZu9Cy8
aLMgtxFrsBVEuNB9cSOtClf1yCsoUie+6dhW9KjYEolYzhctQIACDRfLh7XuDigh
YadNZZl6Xd92GqSiZnGAkUjZVMtvzAyGjs+cYzP71bpsxA1QWTwVZ7tWwTHDevXy
Im4e07pPjB5Dux8MFZP6NvijH3SuaWQ9POapZDqszmslJXpZf4a2wUGqAlvgKtQj
GC41EAX7U+LjXp2k79sPJinG83agskLMId5vPSyfNE0n77vrFxGVqm5WtntZDg+v
s9p5DptDo+eN2+QScgZUbr8GGxwlcJr7xJnvfSEqaIrDIUOsTwKCAQEAwhAvVQsG
G7eQKkPKI014A5k6A3Ces0KTju1IGKsQe1gdOQrfvePwqyG9P9nbn15NoG2SMWDa
sPdfq1JQ6/PZaLs6WNFHAhY4REBR6ucDXB2McipEhW6O6/rOLblRCkPvjVtejHbQ
gqwF4l5cNXhs1vr5W5yp4uBzmbhQTFCKeDq4xRnZlBuuCUsIqUJi9bPiFHJxrdRx
95wxKQh7ft9NBO5U4TVSBrE11fhSONWAaTp7rFBvDkWGP+/RSIbWk7pfCbaTxoXV
X+pBgYzB7y+kcaa2t8nZ/EKt8hrxQ8MERbZIDn04nvYRk153JKbNwjuMETeHmZ5J
zwzqrIe6FsCWPwKCAQEAyqAHCFWgUqmy55vQVYKJ2a4DvAuhDvJ/NM1CRH9nShsF
i50dshfN3h/5fP+6VQTa7q9KSYbz2pjD1DKNY08R+9oxXnmEpdxo7lqBQSmdC1GU
3qjEvbFCVMSWB9biBIZByTUNy1WxwZMDmia8Vn9x2aFRuV7/fFxd15gFXx2ZI0hs
r4NKhgOVKZqo1m8svh42rF2iArT0nRecpBJI9z3JU/ti7aZEnXwrEOY8mXNVtp++
fnSfKW0U2PG2selHfFQmodLq6tV39xe2d7b0d/z1WsO4HXJBtRyo7OL/KemDxF1K
k4ekhk/NpwFm5BXNcvzY8rot5Zzl3dXyeA9TmFvpgwKCAQBetWdkKa0hecRx3AOa
lwQrPWyCoUPSWHuLFWJKJ7IzgB1C6XuoQMYDvsONldUJQgzAbrkaQBp6oz+dbN7x
SGCiLD2dewUcj5uGM53G9lc9bW5NiTNHq1007YIR7o8OY3lVk3HhO1snaqy0fTij
H9J+WJ25iAuhHclNDBakJ+psIrxp9OOq1JdrEaN4d120a8W6FOBF5Zh5L1EOpYUf
tfrwnR/viQYvHe0YL8hw1EGHGXOh9N8+J9ANBA0vSB8QmbQoGWKlUEuCM+EkSH2d
LbMjhClIKMqpwiECNwPn/hTnsL4Z1CL98TlCoqeiy4U/dbA19tPGtOlwku00pki7
MeIhAoIBABQhQgliC5d7Nb/FAwjOWPK8x8T2NRN0ATMUcSzVfpRVuTOWXn2A9CVS
JtL858sgCYvwpnP2MKseY64VZDh8jM3PTr4g8p5mD6GLj6KuUZJZxqg/FQFayfLO
GNHtKX+Ftr58ZEhMzJmAb1idYECkaZjXZPVyy2QiCUYl1xgOFdxNBPpgtwyZTecx
r7BjRFfjC7nHRl3Xf8il2UAOGT1FnEUf3+5vg451OFZ68WpcpZCie1+DebTs3wtI
176pOQ5/zhi9/C/bKl3SeA2QbZvR1/SUo53ylriMa3Sz9wnfW1Vej5VtF57IkX08
anD05Dqrc02PoIlhDEB+tpXyJiZuiVU=
-----END PRIVATE KEY-----
`;

libhttps.createServer({
	cert: selfSignedCertificate,
	key: selfSignedPrivateKey
}, libserver.makeServer({
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
})).listen(443);
