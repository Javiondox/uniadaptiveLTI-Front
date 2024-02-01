import { fetchBackEnd, getLocalToken } from "middleware/common";

interface Payload {
	type: string;
	supportedTypes?: Array<string>;
}

export default async function getModulesByType(payload) {
	return fetchBackEnd(getLocalToken(), "api/lti/auth", "POST", payload);
}
