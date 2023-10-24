import { useNodes } from "reactflow";
import { getNodeById } from "@utils/Nodes";
import { DevModeStatusContext } from "/pages/_app";
import { useContext } from "react";
import { getTypeIcon } from "@utils/NodeIcons";
import { MetaDataContext, PlatformContext, SettingsContext } from "pages/_app";
import { deduplicateById, parseDate } from "@utils/Utils";
import {
	profileOperatorList,
	profileQueryList,
} from "@components/flow/conditions/moodle/condition-components/ProfileComponent";

export default function SimpleConditionsMoodle({ id }) {
	const { devModeStatus } = useContext(DevModeStatusContext);
	const { metaData } = useContext(MetaDataContext);
	const rfNodes = useNodes();
	const { platform } = useContext(PlatformContext);
	const conditions = getNodeById(id, rfNodes)?.data?.c || undefined;
	const qualifications = getNodeById(id, rfNodes)?.data?.g || undefined;
	const { settings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	let { hoverConditions } = parsedSettings;

	/*const flattenConditions = (conditions) => {
		const isBadge = getNodeById(id, rfNodes).type === "badge";
		const recursiveGet = (c, indentation = 1, array = []) => {
			const conditionNames = isBadge ? c?.params : c?.c;
			if (conditionNames) {
				conditionNames.forEach((condition) => {
					array.push({
						...condition,
						indentation,
						[isBadge ? "c" : "c"]: null,
					});
					const moreConditions = isBadge ? condition?.params : condition?.c;
					if (moreConditions) {
						array.push(...recursiveGet(condition, indentation + 1, array));
					}
				});
			}
			return deduplicateById(array);
		};

		return [
			{ ...conditions, indentation: 0, [isBadge ? "c" : "c"]: null },
			...recursiveGet(conditions),
		];
	};*/

	const flattenConditions = (conditions) => {
		const isBadge = getNodeById(id, rfNodes).type === "badge";
		if (!isBadge) {
			const recursiveGet = (c, identation = 1, array = []) => {
				if (c.c) {
					c.c.forEach((condition) => {
						array.push({ ...condition, identation, c: null });
						if (condition.c) {
							array.push(...recursiveGet(condition, identation + 1, array));
						}
					});
				}
				return deduplicateById(array);
			};
			return [
				{ ...conditions, identation: 0, c: null },
				...recursiveGet(conditions),
			];
		} else {
			const recursiveGet = (c, indentation = 1, array = []) => {
				const conditionNames = c?.params;
				if (conditionNames) {
					conditionNames.forEach((condition) => {
						array.push({
							...condition,
							indentation,
							c: null,
						});
						const moreConditions = condition.params;
						if (moreConditions) {
							array.push(...recursiveGet(condition, indentation + 1, array));
						}
					});
				}
				return deduplicateById(array);
			};

			return [
				{ ...conditions, indentation: 0, [isBadge ? "c" : "c"]: null },
				...recursiveGet(conditions),
			];
		}
	};

	const parsedConditionsGroup = [
		{
			op: "&",
			parsed: (
				<a>
					Si se cumplen <b>TODOS</b>:
				</a>
			),
		},
		{
			op: "|",
			parsed: (
				<a>
					Si se cumple <b>UNO:</b>
				</a>
			),
		},
		{
			op: "!&",
			parsed: (
				<a>
					Si NO se cumplen <b>TODOS</b>:
				</a>
			),
		},
		{
			op: "!|",
			parsed: (
				<a>
					Si NO se cumple <b>UNO:</b>
				</a>
			),
		},
	];

	const parsedCompletionBadge = [
		{
			op: "&",
			parsed: (
				<a>
					<b>TODAS</b> las siguientes actividades han sido completadas:
				</a>
			),
		},
		{
			op: "|",
			parsed: (
				<a>
					<b>CUALQUIERA</b> de las siguientes actividades han sido completadas:
				</a>
			),
		},
	];

	const parsedBadgeListBadge = [
		{
			op: "&",
			parsed: (
				<a>
					<b>TODAS</b> las siguientes insignias tienen que haber sido ganadas:
				</a>
			),
		},
		{
			op: "|",
			parsed: (
				<a>
					<b>CUALQUIERA</b> de las siguientes insignias tienen que haber sido
					ganadas:
				</a>
			),
		},
	];

	const parsedSkillsListBadge = [
		{
			op: "&",
			parsed: (
				<a>
					<b>TODAS</b> las siguientes competencias tengan que ser completadas:
				</a>
			),
		},
		{
			op: "|",
			parsed: (
				<a>
					<b>CUALQUIERA</b> de las siguientes competencias tengan que ser
					completadas:
				</a>
			),
		},
	];

	const parseConditions = (flatConditions) => {
		let finalDOM = [
			<p>
				<b>Condiciones:</b>
			</p>,
		];
		flatConditions.map((c) => {
			const prefix = { marginLeft: 24 * c.identation + "px" };
			switch (c.type) {
				case "conditionsGroup":
					const operator =
						getNodeById(id, rfNodes).type == "badge" ? c.method : c.op;

					finalDOM.push(
						<p style={prefix}>
							{parsedConditionsGroup.find((pcg) => operator == pcg.op)?.parsed}{" "}
						</p>
					); //FIXME: It Does not show empty message
					break;
				case "completion":
					let node = getNodeById(id, rfNodes);
					if (node.type !== "badge") {
						const e = [
							"no completado.",
							"completado.",
							"completado y aprobado.",
							"completado y suspendido.",
						];
						finalDOM.push(
							<p style={prefix}>
								{getTypeIcon(getNodeById(c.cm, rfNodes).type, platform)}
								{
									<span style={{ marginLeft: "4px" }}>
										<b>
											{getNodeById(c.cm, rfNodes).data.label} {e[c.e]}
										</b>
									</span>
								}
							</p>
						);
					} else {
						finalDOM.push(
							<>
								<p style={prefix}>
									{
										parsedCompletionBadge.find((pcg) => c.method == pcg.op)
											.parsed
									}
								</p>
								<p style={{ marginLeft: "48px" }}>
									{c.params.map((node) => (
										<p key={node.id}>
											{getTypeIcon(
												getNodeById(node.id, rfNodes).type,
												platform
											)}
											<span style={{ marginLeft: "4px" }}>
												<b>
													{getNodeById(node.id, rfNodes).data.label}{" "}
													{node.date && <>antes del {parseDate(node.date)}</>}
												</b>
											</span>
										</p>
									))}
								</p>
							</>
						);
					}

					break;
				case "courseGrade":
					if (c.min && c.max) {
						finalDOM.push(
							<p style={prefix}>
								La nota del curso entre: <b>{c.min}</b> y <b>{c.max}</b>
							</p>
						);
					}
					if (c.min && c.max == undefined) {
						finalDOM.push(
							<p style={prefix}>
								La nota del curso superará a: <b>{c.min}</b>
							</p>
						);
					}
					if (c.min == undefined && c.max) {
						finalDOM.push(
							<p style={prefix}>
								La nota del curso será inferior a: <b>{c.max}</b>
							</p>
						);
					}
					break;
				case "date":
					const parsedDate = new Date(c.t).toLocaleDateString("es-ES");
					if (parsedDate != "Invalid Date")
						finalDOM.push(
							<p style={prefix}>
								{
									(c.d = ">=" ? (
										<>
											A partir del: <b>{parsedDate}</b>
										</>
									) : (
										<>
											Antes del: <b>{parsedDate}</b>
										</>
									))
								}
							</p>
						);
					break;
				case "grade":
					{
						let sufix;
						if (c.min && c.max) {
							sufix = (
								<>
									entre: <b>{c.min}</b> y <b>{c.max}</b>
								</>
							);
						}
						if (c.min && c.max == undefined) {
							sufix = (
								<>
									superará: <b>{c.min}</b>
								</>
							);
						}
						if (c.min == undefined && c.max) {
							sufix = (
								<>
									inferior a: <b>{c.max}</b>
								</>
							);
						}

						finalDOM.push(
							<p style={prefix}>
								{getTypeIcon(getNodeById(c.cm, rfNodes).type, platform)}
								{
									<span style={{ marginLeft: "4px" }}>
										<b>{getNodeById(c.cm, rfNodes).data.label}</b> {sufix}
									</span>
								}
							</p>
						);
					}
					break;
				case "group":
					finalDOM.push(
						<p style={prefix}>
							{
								<>
									Grupo:{" "}
									<b>
										{c.groupId == null
											? "Cualquier grupo"
											: metaData.groups.find((g) => g.id == c.groupId).name}
									</b>
								</>
							}
						</p>
					);
					break;
				case "grouping":
					finalDOM.push(
						<p style={prefix}>
							{
								<>
									Agrupamiento:{" "}
									<b>
										{c.groupingId == null
											? "Cualquier agrupamiento"
											: metaData.groupings.find((g) => g.id == c.groupingId)
													.name}
									</b>
								</>
							}
						</p>
					);
					break;
				case "profile":
					{
						finalDOM.push(
							<p style={prefix}>
								{
									<>
										Perfil:{" "}
										<b>
											{profileOperatorList.find((sf) => c.sf == sf.value).name}{" "}
											{profileQueryList.find((op) => c.op == op.value).name}{" "}
											{c.v}
										</b>
									</>
								}
							</p>
						);
					}
					break;
				case "role":
					finalDOM.push(
						<>
							<p style={prefix}>
								Debe ser otorgada a los usuarios con{" "}
								{c.method === "&" && <b>TODOS</b>}{" "}
								{c.method === "|" && (
									<>
										<b>CUALQUIERA</b> <a>de</a>
									</>
								)}{" "}
								los siguientes roles:
								<ul>
									{c.params.map((option) => {
										const roleList = metaData.role_list;
										const roleFounded = roleList.find(
											(roleMeta) => roleMeta.id.toString() === option.toString()
										);
										return <li key={roleFounded.id}>{roleFounded.name}</li>;
									})}
								</ul>
							</p>
						</>
					);
					break;
				case "courseCompletion":
					{
						(!c.method || c.method === "0" || c.method === "") &&
							!c.dateTo &&
							finalDOM.push(
								<div style={prefix}>
									Debe finalizarse el curso <strong>{metaData.name}</strong>
								</div>
							);
					}
					{
						(c.method || c.dateTo) &&
							finalDOM.push(
								<>
									<div style={prefix}>
										<a>
											Debe finalizarse el curso <b>{metaData.name}</b>
										</a>
										{c.dateTo && (
											<a>
												{" "}
												antes del <strong>{parseDate(c.dateTo)}</strong>
											</a>
										)}
										{c.method && c.method !== "0" && c.method !== "" && (
											<a>
												{" "}
												con calificación mínima de <strong>{c.method}</strong>
											</a>
										)}
									</div>
									<br></br>
								</>
							);
					}
					break;
				case "badgeList":
					finalDOM.push(
						<>
							<p style={prefix}>
								{parsedBadgeListBadge.find((pcg) => c.method == pcg.op).parsed}
							</p>
							<ul style={prefix}>
								{c.params.map((badge) => {
									const metaBadgeList = metaData.badges;
									const badgeFounded = metaBadgeList.find(
										(metaBadge) => metaBadge.id.toString() === badge
									);

									return <li key={badgeFounded.id}>{badgeFounded.name}</li>;
								})}
							</ul>
						</>
					);
					break;
				case "skills":
					finalDOM.push(
						<>
							<p style={prefix}>
								{parsedSkillsListBadge.find((pcg) => c.method == pcg.op).parsed}
							</p>
							<ul style={prefix}>
								{c.params.map((skill) => {
									const metaSkillsList = metaData.skills;

									const skillFounded = metaSkillsList.find(
										(metaSkill) => metaSkill.id.toString() === skill.toString()
									);

									return <li key={skillFounded.id}>{skillFounded.name}</li>;
								})}
							</ul>
						</>
					);
					break;
				default:
					break;
			}
		});

		return finalDOM;
	};
	const parseQualifications = (q) => {
		const used = q.hasConditions || q.hasToBeQualified || q.hasToBeSeen;
		let finalDOM = [
			<p>
				<b>Para que el elemento se considere finalizado:</b>
			</p>,
		];

		if (used) {
			if (q && q.hasToBeSeen == 1) {
				finalDOM.push(<p style={{ marginLeft: 24 }}>Debe de ser visto.</p>);
			}
			if (q && q.hasToBeQualified == 1) {
				finalDOM.push(
					<p style={{ marginLeft: 24 }}>Debe de ser calificado o marcado.</p>
				);
			}
			if (q && q.hasConditions == 1) {
				finalDOM.push(
					<p>
						<b>Con las siguientes condiciones adicionales:</b>
					</p>
				);
			}

			if (q && q.data) {
				if (q.data.hasToSelect) {
					finalDOM.push(
						<p style={{ marginLeft: 24 }}>Debe tener una selección.</p>
					);
				}
				if (q.data.min) {
					finalDOM.push(
						<p style={{ marginLeft: 24 }}>
							Nota mínima: <b>{q.data.min}</b>
						</p>
					);
				}
				if (q.data.max) {
					finalDOM.push(
						<p style={{ marginLeft: 24 }}>
							Nota máxima: <b>{q.data.max}</b>
						</p>
					);
				}
			}
		} else {
			finalDOM.push(
				<p>
					No se deberá de hacer nada, debido a que no se definieron ajustes de
					finalización.
				</p>
			);
		}

		return finalDOM;
	};

	const devString = <div>{JSON.stringify(getNodeById(id, rfNodes))}</div>;
	if ((conditions && hoverConditions) || (qualifications && !hoverConditions)) {
		//Show the preference
		let finalString = hoverConditions
			? parseConditions(flattenConditions(conditions))
			: parseQualifications(qualifications);

		return (
			<div>
				<p>
					<b>{getNodeById(id, rfNodes).data.label}</b>
				</p>
				<hr />
				<div>{devModeStatus ? [devString, ...finalString] : finalString}</div>
			</div>
		);
	} else {
		if (
			(conditions && hoverConditions) ||
			(qualifications && !hoverConditions)
		) {
			//Show the preference
			let finalString = hoverConditions
				? parseConditions(flattenConditions(conditions))
				: parseQualifications(qualifications);
			return (
				<div>
					<p>
						<b>{getNodeById(id, rfNodes).data.label}</b>
					</p>
					<hr />
					<div>{devModeStatus ? [devString, ...finalString] : finalString}</div>
				</div>
			);
		} else {
			//If unable to show the preference, show the alternative
			if (conditions && !qualifications) {
				let finalString = parseConditions(flattenConditions(conditions));
				return (
					<div>
						<p>
							<b>{getNodeById(id, rfNodes).data.label}</b>
						</p>
						<hr />
						<div>
							{devModeStatus ? [devString, ...finalString] : finalString}
						</div>
					</div>
				);
			} else {
				return (
					<div>
						<p>
							<b>{getNodeById(id, rfNodes).data.label}</b>
						</p>
						<hr />
						<p>
							Aquí se priorizará mostrar información resumida sobre{" "}
							<b>
								{hoverConditions
									? "las condiciones"
									: "los ajustes de calificación"}
							</b>{" "}
							el bloque seleccionado.
						</p>
					</div>
				);
			}
		}
	}
}
