import { NodeTypes } from "./TypeDefinitions";

export function getVisibilityOptions(platform) {
	switch (platform) {
		case "moodle":
			return [
				{ name: "Ocultar hasta tener acceso", value: "hidden_until_access" },
				{ name: "Mostrar siempre sin acceso", value: "show_unconditionally" },
			];
		case "sakai":
			return [
				{ name: "Ocultar hasta tener acceso", value: "hidden_until_access" },
				{ name: "Mostrar siempre sin acceso", value: "show_unconditionally" },
			];
		default:
			return [
				{ name: "Ocultar hasta tener acceso", value: "hidden_until_access" },
				{ name: "Mostrar siempre sin acceso", value: "show_unconditionally" },
			];
	}
}

export function getDefaultVisibility(platform) {
	switch (platform) {
		case "moodle":
			return "hidden_until_access";
		case "sakai":
			return "hidden_until_access";
		default:
			return "hidden_until_access";
	}
}

export function hasLessons(platform) {
	switch (platform) {
		case "moodle":
			return false;
		case "sakai":
			return true;
		default:
			return false;
	}
}

export function hasUnorderedResources(platform) {
	switch (platform) {
		case "moodle":
			return false;
		case "sakai":
			return true;
		default:
			return false;
	}
}

export function startingSectionID(platform) {
	switch (platform) {
		case "moodle":
			return 0;
		case "sakai":
			return 1;
		default:
			return 1;
	}
}

export function allowsPartialExport(platform) {
	switch (platform) {
		case "moodle":
			return true;
		case "sakai":
			return true;
		default:
			return false;
	}
}

export function getBackupURL(platform, metaData) {
	switch (platform) {
		case "moodle":
			return `${metaData.lms_url}/backup/backup.php?id=${metaData.course_id}`;
		default:
			return null;
	}
}

export function isSupportedTypeInPlatform(platform, type, excludeLTI = false) {
	if (excludeLTI) {
		return NodeTypes.find(
			(definition) =>
				definition.type == type && definition.lms.includes(platform)
		)
			? true
			: false;
	} else {
		return NodeTypes.find(
			(definition) =>
				definition.type == type &&
				(definition.lms.includes(platform) || definition.lms.includes("lti"))
		)
			? true
			: false;
	}
}

export function getSupportedTypes(platform) {
	return NodeTypes.map((declaration) => {
		if (declaration.includes(platform)) return declaration.type;
	});
}
