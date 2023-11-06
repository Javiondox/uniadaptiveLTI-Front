import styles from "/styles/Aside.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCaretDown,
	faCaretUp,
	faRotateRight,
	faCompress,
	faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useReactFlow } from "reactflow";
import {
	Tooltip,
	Button,
	Form,
	Spinner,
	OverlayTrigger,
} from "react-bootstrap";
import { useState, useContext, useEffect, useRef, useId, version } from "react";
import {
	ErrorListContext,
	PlatformContext,
	NodeInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	VersionInfoContext,
	VersionJsonContext,
	SettingsContext,
	MetaDataContext,
} from "../pages/_app.js";
import {
	capitalizeFirstLetter,
	deduplicateById,
	getUpdatedArrayById,
	orderByPropertyAlphabetically,
	fetchBackEnd,
	handleNameCollision,
} from "@utils/Utils";
import {
	ActionNodes,
	getLastPositionInSection,
	reorderFromSection,
	reorderFromSectionAndColumn,
} from "@utils/Nodes";
import { errorListCheck } from "@utils/ErrorHandling";
import {
	NodeTypes,
	getMoodleTypes,
	getSakaiTypes,
} from "@utils/TypeDefinitions.js";
import {
	getSupportedTypes,
	getVisibilityOptions,
	hasUnorderedResources,
} from "@utils/Platform.js";
import { getLastPositionInSakaiColumn } from "@utils/Sakai";

export default function Aside({ LTISettings, className, closeBtn, svgExists }) {
	const { errorList, setErrorList } = useContext(ErrorListContext);

	const [expandedContent, setExpandedContent] = useState(true);
	const [expandedInteract, setExpandedInteract] = useState(true);

	const [selectedOption, setSelectedOption] = useState("");
	const [lmsResource, setLmsResource] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const [allowResourceSelection, setAllowResourceSelection] = useState(true);

	const { platform, setPlatform } = useContext(PlatformContext);
	const shownTypes = getVisibilityOptions(platform);
	const { nodeSelected, setNodeSelected } = useContext(NodeInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(VersionInfoContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const { metaData, setMetaData } = useContext(MetaDataContext);

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations, autoHideAside } = parsedSettings;
	//References
	const autoFocus = useRef(null);
	const labelDOM = useRef(null);
	const optionsDOM = useRef(null);
	const resourceDOM = useRef(null);
	const lmsResourceDOM = useRef(null);
	const mapTitleDOM = useRef(null);
	const versionTitleDOM = useRef(null);
	const refreshIconDOM = useRef(null);
	const lmsVisibilityDOM = useRef(null);
	const sectionDOM = useRef(null);
	const orderDOM = useRef(null);
	const indentDOM = useRef(null);
	//IDs
	const labelDOMId = useId();
	const optionsID = useId();
	const lmsResourceDOMId = useId();
	const typeDOMId = useId();
	const sectionDOMId = useId();
	const lmsVisibilityDOMId = useId();
	const orderDOMId = useId();
	const indentDOMId = useId();
	//TODO: Add the rest

	const [resourceOptions, setResourceOptions] = useState([]);
	const { versionJson, setVersionJson } = useContext(VersionJsonContext);
	const reactFlowInstance = useReactFlow();

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);

	const moodleResource = orderByPropertyAlphabetically(
		getMoodleTypes(),
		"name"
	);
	const sakaiResource = orderByPropertyAlphabetically(getSakaiTypes(), "name");

	const fetchResources = async (selectedOption) => {
		try {
			const encodedSelectedOption = encodeURIComponent(selectedOption);
			setShowSpinner(true);
			setAllowResourceSelection(false);
			const payload = {
				type:
					selectedOption == "generic" ? "unsupported" : encodedSelectedOption,
			};

			if (selectedOption == "generic") {
				setShowSpinner(false);
				setAllowResourceSelection(true);
				return [];
			}

			const response = await fetchBackEnd(
				LTISettings,
				sessionStorage.getItem("token"),
				"api/lti/get_modules_by_type",
				"POST",
				payload
			);

			if (
				!response ||
				!response.ok ||
				(response?.ok && response?.ok == false)
			) {
				/* Old error handler
				throw new Error("Request failed");
				*/
				console.error(`❌ Error: `, response.status);
				toast({
					hideProgressBar: false,
					autoClose: 2000,
					type: "error",
					position: "bottom-center",
				});
			}

			const data = response.data.items;

			setShowSpinner(false);
			setAllowResourceSelection(true);
			return data;
		} catch (e) {
			// const error = new Error(
			// 	"No se pudieron obtener los datos del curso desde el LMS.\n" + e
			// );
			// error.log = e;
			// throw error;
		}
	};

	useEffect(() => {
		//FIXME: No sucede
		if (!selectedOption) {
			setResourceOptions([]);
		} else {
			if (LTISettings.debugging.dev_files) {
				setResourceOptions([]);
				setTimeout(() => {
					const data = [
						{
							id: 0,
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} A`,
						},
						{
							id: 1,
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} B`,
						},
						{
							id: 2,
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} C`,
						},
						{
							id: 3,
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} D`,
						},
					];
					const filteredData = [];
					data.forEach((resource) => {
						if (!getUsedResources().includes(resource.id)) {
							filteredData.push(resource);
						}
					});

					//Adds current resource if exists
					if (nodeSelected && nodeSelected.data) {
						if (nodeSelected.data.lmsResource != undefined) {
							if (nodeSelected.data.lmsResource != "") {
								const lmsRes = nodeSelected.data.lmsResource;
								const storedRes = data.find(
									(resource) => resource.id == lmsRes
								);

								if (storedRes != undefined) {
									filteredData.push(storedRes);
								}
							}
						}
					}

					const uniqueFilteredData = orderByPropertyAlphabetically(
						deduplicateById(filteredData),
						"name"
					);
					uniqueFilteredData.unshift({
						id: -1,
						name: NodeTypes.filter((node) => node.type == selectedOption)[0]
							.emptyName,
					});
					setResourceOptions(uniqueFilteredData);
				}, 1000);
			} else {
				fetchResources(selectedOption).then((data) => {
					const filteredData = [];
					data.forEach((resource) => {
						if (!getUsedResources().includes(resource.id)) {
							filteredData.push(resource);
						}
					});
					//Adds current resource if exists
					if (nodeSelected && nodeSelected.data) {
						if (nodeSelected.data.lmsResource) {
							if (nodeSelected.data.lmsResource != "") {
								const lmsRes = nodeSelected.data.lmsResource;
								const storedRes = data.find(
									(resource) => resource.id == lmsRes
								);

								if (storedRes != undefined) {
									filteredData.push(storedRes);
								}
							}
						}
					}
					const uniqueFilteredData = orderByPropertyAlphabetically(
						deduplicateById(filteredData),
						"name"
					);
					uniqueFilteredData.forEach((option) => {
						return hasUnorderedResources(platform)
							? (option.oname = `${option.name}`)
							: (option.oname = `${option.name} ${
									option.section > -1 ? "- Sección: " + option.section : ""
							  }`);
					});
					uniqueFilteredData.unshift({
						id: -1,
						name: NodeTypes.filter((node) => node.type == selectedOption)[0]
							.emptyName,
					});

					setResourceOptions(uniqueFilteredData);
				});
			}
		}
	}, [selectedOption, nodeSelected]);

	useEffect(() => {
		if (nodeSelected) {
			if (resourceOptions.length > 0) {
				const resourceIDs = resourceOptions.map((resource) => resource.id);
				const lmsResourceCurrent = lmsResourceDOM.current;
				if (lmsResourceCurrent) {
					if (resourceIDs.includes(nodeSelected.data.lmsResource)) {
						lmsResourceCurrent.value = nodeSelected.data.lmsResource;
					} else {
						lmsResourceCurrent.value = "-1";
					}
				}
				setLmsResource(nodeSelected.data.lmsResource);
			}
		}
	}, [resourceOptions]);

	const syncLabel = (e) => {
		if (nodeSelected) {
			if (
				!(
					(ActionNodes.includes(nodeSelected.type) &&
						nodeSelected.type != "badge") ||
					nodeSelected.type == "fragment"
				)
			) {
				const labelCurrent = labelDOM.current;
				labelCurrent.value =
					e.target.options[e.target.selectedIndex].text ||
					handleNameCollision(
						NodeTypes.find((ntype) => nodeSelected.type == ntype.type)
							.emptyName,
						reactFlowInstance.getNodes().map((node) => node?.data?.label),
						false,
						"("
					);
			}
		}
	};

	const handleSelect = (event) => {
		// FIXME Del cambio de calquier tipo a mail el icono refresh no se mapea por lo que no puede pillar las referencia
		setSelectedOption(event.target.value);
	};

	useEffect(() => {
		if (nodeSelected) {
			const labelCurrent = labelDOM.current;
			const typeCurrent = resourceDOM.current;
			const lmsVisibilityCurrent = lmsVisibilityDOM.current;
			const sectionCurrent = sectionDOM.current;
			const orderCurrent = orderDOM.current;
			const indentCurrent = indentDOM.current;

			if (labelCurrent) {
				labelCurrent.value = nodeSelected.data.label;
			}

			if (typeCurrent) {
				typeCurrent.value = nodeSelected.type;
			}

			if (lmsVisibilityCurrent) {
				lmsVisibilityCurrent.value = nodeSelected.data.lmsVisibility;
			}

			if (sectionCurrent) {
				sectionCurrent.value = nodeSelected.data.section;
			}

			if (orderCurrent) {
				orderCurrent.value = nodeSelected.data.order + 1;
			}

			if (indentCurrent) {
				if (platform == "sakai") {
					indentCurrent.value = nodeSelected.data.indent + 1;
				} else {
					indentCurrent.value = nodeSelected.data.indent;
				}
			}

			setSelectedOption(nodeSelected.type);
		}
	}, [nodeSelected]);

	/**
	 * Focuses into the aside if autoHideAside is active and autoFocus is visible
	 */
	useEffect(() => {
		if (autoFocus && autoHideAside) {
			autoFocus.current.focus();
		}
	});

	/**
	 * Updates the selected block with the values from the specified DOM elements.
	 */
	const updateBlock = () => {
		if (nodeSelected.type != "fragment") {
			let type = resourceDOM.current.value;
			let newData;
			if (!ActionNodes.includes(nodeSelected.type)) {
				//if element node
				const getValue = (dom) => Number(dom?.current?.value || 0);
				const newSection = getValue(sectionDOM);
				const newIndent = getValue(indentDOM);
				const {
					section: originalSection,
					indent: originalIndent,
					order: originalOrder,
				} = nodeSelected.data;

				const limitedOrder = Math.min(
					Math.max(orderDOM.current.value, 0),
					platform != "sakai"
						? getLastPositionInSection(
								newSection,
								reactFlowInstance.getNodes()
						  ) + 1
						: getLastPositionInSakaiColumn(
								newSection,
								newIndent,
								reactFlowInstance.getNodes()
						  ) + 1
				);
				let limitedindent = Math.min(Math.max(indentDOM.current.value, 0), 16);

				newData = {
					...nodeSelected.data,
					label: labelDOM.current.value,
					lmsResource: lmsResourceDOM.current.value,
					lmsVisibility: lmsVisibilityDOM?.current?.value
						? lmsVisibilityDOM?.current?.value
						: platform == "moodle"
						? "hidden"
						: "hidden_until_access",
					section: newSection,
					order: limitedOrder - 1,
					indent: platform == "sakai" ? limitedindent - 1 : limitedindent,
				};

				const updatedData = {
					...nodeSelected,
					id: nodeSelected.id,
					type: resourceDOM.current.value,
					data: newData,
				};

				const aNodeWithNewOrderExists = reactFlowInstance
					.getNodes()
					.some(
						(node) =>
							node.data.order == limitedOrder - 1 &&
							node.data.section == newSection
					);

				const reorderNodes = (newSection, originalOrder, limitedOrder) => {
					const [from, to] = [originalOrder, limitedOrder - 1];
					const reorderedArray = reorderFromSection(
						newSection,
						from,
						to,
						reactFlowInstance.getNodes()
					);
					reactFlowInstance.setNodes([...reorderedArray, updatedData]);
				};

				const reorderNodesColumn = (
					newSection,
					newColumn,
					originalOrder,
					limitedOrder
				) => {
					const [from, to] = [originalOrder, limitedOrder - 1];
					const reorderedArray = reorderFromSectionAndColumn(
						newSection,
						newColumn,
						from,
						to,
						reactFlowInstance.getNodes()
					);

					reactFlowInstance.setNodes([
						...reactFlowInstance.getNodes(),
						...reorderedArray,
						updatedData,
					]);
				};

				const updateNodes = (updatedData) => {
					reactFlowInstance.setNodes(
						getUpdatedArrayById(updatedData, reactFlowInstance.getNodes())
					);
				};

				if (
					aNodeWithNewOrderExists ||
					originalSection != newSection ||
					(platform == "sakai" && originalIndent != newIndent)
				) {
					if (originalSection == newSection && platform != "sakai") {
						//Change in order
						reorderNodes(newSection, originalOrder, limitedOrder);
					} else {
						const virtualNodes = reactFlowInstance.getNodes();
						const forcedPos =
							platform == "moodle"
								? getLastPositionInSection(newSection, virtualNodes) + 1
								: getLastPositionInSakaiColumn(
										newSection,
										newIndent,
										virtualNodes
								  ) + 1;

						if (platform == "moodle") updatedData.data.order = forcedPos;
						if (platform == "sakai") updatedData.data.order = forcedPos - 1;
						virtualNodes.push(updatedData);
						if (!(limitedOrder - 1 > forcedPos)) {
							//If the desired position is inside the section
							reorderNodesColumn(
								newSection,
								newIndent,
								forcedPos + 1,
								limitedOrder
							);
						} else {
							//If the desired position is outside the section

							updateNodes(updatedData);
						}
					}
				} else {
					updateNodes(updatedData);
				}

				errorListCheck(updatedData, errorList, setErrorList, false);
			} else {
				//if action node
				newData = {
					...nodeSelected.data,
					label: labelDOM.current.value,
					lmsResource: type !== "mail" ? lmsResourceDOM.current.value : type,
				};

				const updatedData = {
					...nodeSelected,
					id: nodeSelected.id,
					type: resourceDOM.current.value,
					data: newData,
				};

				errorListCheck(updatedData, errorList, setErrorList, false);

				reactFlowInstance.setNodes(
					getUpdatedArrayById(updatedData, reactFlowInstance.getNodes())
				);

				errorListCheck(updatedData, errorList, setErrorList);
			}

			if (autoHideAside) {
				setExpandedAside(false);
			}
		} else {
			const newData = {
				...nodeSelected.data,
				label: labelDOM.current.value,
			};

			const updatedData = {
				...nodeSelected,
				id: nodeSelected.id,
				data: newData,
			};

			reactFlowInstance.setNodes(
				getUpdatedArrayById(updatedData, reactFlowInstance.getNodes())
			);
		}
	};

	/**
	 * Updates the selected map with the value from the specified DOM element.
	 */
	const updateMap = () => {
		setMapSelected((prevMap) => ({
			...prevMap,
			id: mapSelected.id,
			name: mapTitleDOM.current.value,
		}));
	};

	/**
	 * Updates the selected version with the value from the specified DOM element.
	 */
	const updateVersion = () => {
		setVersionJson((prevVersionJson) => ({
			...prevVersionJson,
			id: editVersionSelected.id,
			name: versionTitleDOM.current.value,
			lastUpdate: editVersionSelected.lastUpdate,
			default: editVersionSelected.default,
		}));
	};

	const getUsedResources = () => {
		const nodes = reactFlowInstance.getNodes();
		const usedResources = [];
		nodes.map((node) => {
			if (node.data.lmsResource != undefined) {
				usedResources.push(node.data.lmsResource);
			}
		});
		return usedResources;
	};

	return (
		<aside id="aside" className={`${className} ${styles.aside}`}>
			<div className={"text-center p-2"}>
				<div
					ref={autoFocus}
					role="button"
					onClick={() => setExpandedAside(false)}
					className={
						styles.uniadaptive + " " + (reducedAnimations && styles.noAnimation)
					}
					style={{ transition: "all 0.5s ease" }}
					tabIndex={0}
				>
					<img
						alt="Logo"
						src={LTISettings.branding.logo_path}
						style={{ width: "100%", userSelect: "none" }}
					/>
					<span className={styles.collapse + " display-6"}>
						<FontAwesomeIcon width={38} height={38} icon={faCompress} />
					</span>
				</div>
				<hr />
				<div id={mapSelected?.id}></div>
			</div>

			{nodeSelected &&
			!(nodeSelected.type == "start" || nodeSelected.type == "end") ? (
				<Form
					action="#"
					method=""
					onSubmit={allowResourceSelection ? updateBlock : false}
				>
					<div className="container-fluid">
						<Form.Group className="mb-3">
							<div
								className="d-flex gap-2"
								role="button"
								onClick={() => setExpandedContent(!expandedContent)}
							>
								<div className="fw-bold">Contenido</div>
								<div>
									<div>
										{!expandedContent ? (
											<FontAwesomeIcon icon={faCaretUp} />
										) : (
											<FontAwesomeIcon icon={faCaretDown} />
										)}
									</div>
								</div>
							</div>
							<div
								className={[
									styles.uniadaptiveDetails,
									expandedContent ? styles.active : null,
									reducedAnimations && styles.noAnimation,
								].join(" ")}
							>
								<Form.Group className="mb-3">
									<Form.Label htmlFor={labelDOMId} className="mb-1">
										Nombre del{" "}
										{nodeSelected.type == "fragment" ? "fragmento" : "bloque"}
									</Form.Label>
									<Form.Control
										ref={labelDOM}
										id={labelDOMId}
										type="text"
										className="w-100"
										disabled={
											!(
												(ActionNodes.includes(nodeSelected.type) &&
													nodeSelected.type != "badge") ||
												nodeSelected.type == "fragment"
											)
										}
									></Form.Control>
								</Form.Group>
								{nodeSelected.type != "fragment" && (
									<Form.Group className="mb-3">
										<div className="d-flex justify-content-between">
											<Form.Label htmlFor={typeDOMId} className="mb-1">
												{ActionNodes.includes(nodeSelected.type)
													? "Acción a realizar"
													: "Tipo de recurso"}
											</Form.Label>
											<div>
												<OverlayTrigger
													placement="right"
													overlay={
														ActionNodes.includes(nodeSelected.type) ? (
															<Tooltip>{`Listado de acciones que pueda ejecutar ${capitalizeFirstLetter(
																platform
															)}.`}</Tooltip>
														) : (
															<Tooltip>{`Listado de tipos de recursos compatibles con ${capitalizeFirstLetter(
																platform
															)}.`}</Tooltip>
														)
													}
													trigger={["hover", "focus"]}
												>
													<FontAwesomeIcon
														icon={faCircleQuestion}
														tabIndex={0}
													/>
												</OverlayTrigger>
											</div>
										</div>
										<Form.Select
											ref={resourceDOM}
											id={typeDOMId}
											className="w-100"
											defaultValue={selectedOption}
											onChange={handleSelect}
										>
											{platform == "moodle"
												? moodleResource.map((option) => {
														if (
															(ActionNodes.includes(nodeSelected.type) &&
																option.nodeType == "ActionNode") ||
															(!ActionNodes.includes(nodeSelected.type) &&
																option.nodeType == "ElementNode")
														) {
															return (
																<option key={option.id} value={option.value}>
																	{option.name}
																</option>
															);
														}
												  })
												: sakaiResource.map((option) => {
														if (
															(ActionNodes.includes(nodeSelected.type) &&
																option.nodeType == "ActionNode") ||
															(!ActionNodes.includes(nodeSelected.type) &&
																option.nodeType == "ElementNode")
														) {
															return (
																<option key={option.id} value={option.value}>
																	{option.name}
																</option>
															);
														}
												  })}
										</Form.Select>
									</Form.Group>
								)}

								{!(
									nodeSelected.type == "fragment" ||
									nodeSelected.type == "mail" ||
									selectedOption == "mail"
								) && (
									<div className="mb-3">
										<div className="d-flex gap-2">
											<div className="d-flex align-items-center justify-content-between w-100">
												<div className="d-flex align-items-center justify-content-between">
													<Form.Label
														htmlFor={lmsResourceDOMId}
														className="mb-1"
													>
														{`Recurso en ${capitalizeFirstLetter(platform)}`}
													</Form.Label>
													<div className="ms-2">
														{!showSpinner && (
															<div ref={refreshIconDOM}>
																<FontAwesomeIcon icon={faRotateRight} />
															</div>
														)}
														{showSpinner && (
															<div ref={refreshIconDOM}>
																<Spinner
																	animation="border"
																	role="status"
																	size="sm"
																>
																	<span className="visually-hidden">
																		Loading...
																	</span>
																</Spinner>
															</div>
														)}
													</div>
												</div>
												<div>
													<OverlayTrigger
														placement="right"
														overlay={
															<Tooltip>{`Solo se mostrarán elementos existentes en ${capitalizeFirstLetter(
																platform
															)}. Para crear un elemento nuevo en ${capitalizeFirstLetter(
																platform
															)}, presione este botón.`}</Tooltip>
														}
														trigger={["hover", "focus"]}
													>
														<Button
															className={`btn-light d-flex align-items-center p-0 m-0 ${styles.actionButtons}`}
															onClick={() =>
																window.open(
																	metaData.return_url.startsWith("http")
																		? metaData.return_url
																		: "https://" + metaData.return_url,
																	"_blank"
																)
															}
														>
															<FontAwesomeIcon icon={faCircleQuestion} />
														</Button>
													</OverlayTrigger>
												</div>
											</div>
										</div>
										<Form.Select
											ref={lmsResourceDOM}
											id={lmsResourceDOMId}
											className="w-100"
											defaultValue={lmsResource == "" ? lmsResource : "-1"}
											disabled={!resourceOptions.length > 0}
											onChange={syncLabel}
										>
											{allowResourceSelection && (
												<>
													<option key="-1" hidden value>
														{"Esperando recursos..."}
													</option>
													{resourceOptions.map((resource) => (
														<option key={resource.id} value={resource.id}>
															{resource.oname != undefined
																? resource.oname
																: resource.name}
														</option>
													))}
												</>
											)}
										</Form.Select>
									</div>
								)}
							</div>
						</Form.Group>
						{!(
							ActionNodes.includes(nodeSelected.type) ||
							nodeSelected.type == "fragment"
						) && (
							<div className="mb-2">
								<div
									className="d-flex gap-2"
									role="button"
									onClick={() => setExpandedInteract(!expandedInteract)}
								>
									<div className="fw-bold">Interacción</div>
									<div>
										<div role="button">
											{!expandedInteract ? (
												<FontAwesomeIcon icon={faCaretUp} />
											) : (
												<FontAwesomeIcon icon={faCaretDown} />
											)}
										</div>
									</div>
								</div>

								<div
									className={[
										styles.uniadaptiveDetails,
										expandedInteract ? styles.active : null,
										reducedAnimations && styles.noAnimation,
									].join(" ")}
								>
									{platform == "moodle" && (
										<Form.Group className="mb-2">
											<Form.Label htmlFor={lmsVisibilityDOMId}>
												Visibilidad
											</Form.Label>
											<Form.Select
												ref={lmsVisibilityDOM}
												id={lmsVisibilityDOMId}
												defaultValue={nodeSelected.data.lmsVisibility}
											>
												{orderByPropertyAlphabetically(shownTypes, "name").map(
													(option) => (
														<option key={option.value} value={option.value}>
															{option.name}
														</option>
													)
												)}
												{/*<option>Ocultar hasta tener acceso</option>
											<option>Mostrar siempre sin acceso</option>*/}
											</Form.Select>
										</Form.Group>
									)}

									<>
										{platform == "moodle" && (
											<Form.Group className="mb-2">
												<Form.Label htmlFor={sectionDOMId}>Sección</Form.Label>
												<Form.Select
													ref={sectionDOM}
													id={sectionDOMId}
													defaultValue={nodeSelected.data.section}
												>
													{metaData.sections &&
														orderByPropertyAlphabetically(
															[...metaData.sections].map((section) => {
																const newSection = section;
																if (!section.name.match(/^\d/)) {
																	newSection.name =
																		platform == "moodle"
																			? newSection.position +
																			  "- " +
																			  newSection.name
																			: newSection.position +
																			  1 +
																			  "- " +
																			  newSection.name;
																	newSection.value = newSection.position + 1;
																}
																return newSection;
															}),
															"name"
														).map((section) => (
															<option key={section.id} value={section.position}>
																{section.name}
															</option>
														))}
												</Form.Select>
											</Form.Group>
										)}
										{platform == "sakai" && (
											<Form.Group className="mb-2">
												<Form.Label htmlFor={sectionDOMId}>Sección</Form.Label>
												<Form.Control
													type="number"
													min={1}
													max={999}
													defaultValue={nodeSelected.data.section}
													ref={sectionDOM}
													id={sectionDOMId}
												></Form.Control>
											</Form.Group>
										)}
										{platform == "sakai" && (
											<Form.Group className="mb-2">
												<Form.Label htmlFor={indentDOMId}>Columna</Form.Label>
												<Form.Control
													type="number"
													min={1}
													max={16}
													defaultValue={nodeSelected.data.indent + 1}
													ref={indentDOM}
													id={indentDOMId}
												></Form.Control>
											</Form.Group>
										)}
										<Form.Group className="mb-2">
											<Form.Label htmlFor={orderDOMId}>
												{platform === "sakai"
													? "Posición"
													: "Posición en la sección"}
											</Form.Label>
											<Form.Control
												type="number"
												min={1}
												max={999}
												defaultValue={nodeSelected.data.order}
												ref={orderDOM}
												id={orderDOMId}
											></Form.Control>
										</Form.Group>
										{platform == "moodle" && (
											<Form.Group className="mb-2">
												<Form.Label htmlFor={indentDOMId}>
													Identación en la sección
												</Form.Label>
												<Form.Control
													type="number"
													min={0}
													max={16}
													defaultValue={nodeSelected.data.indent}
													ref={indentDOM}
													id={indentDOMId}
												></Form.Control>
											</Form.Group>
										)}
									</>
								</div>
							</div>
						)}

						<Button onClick={updateBlock} disabled={!allowResourceSelection}>
							Guardar
						</Button>
					</div>
				</Form>
			) : (
				<></>
			)}

			{mapSelected && !(nodeSelected || editVersionSelected) ? (
				<Form
					className="container-fluid"
					action="#"
					method=""
					onSubmit={updateMap}
				>
					<Form.Group className="mb-3">
						<div
							className="d-flex gap-2"
							role="button"
							onClick={() => setExpandedAside(!expandedAside)}
						>
							<div className="fw-bold">Contenido</div>
							<div>
								<div>
									{!expandedAside ? (
										<FontAwesomeIcon icon={faCaretUp} />
									) : (
										<FontAwesomeIcon icon={faCaretDown} />
									)}
								</div>
							</div>
						</div>
						<div
							className={[
								styles.uniadaptiveDetails,
								expandedAside && styles.active,
								reducedAnimations && styles.noAnimation,
							]}
						>
							<Form.Group className="mb-3">
								<Form.Label className="mb-1">Nombre del mapa</Form.Label>
								<Form.Control
									id="map-title"
									ref={mapTitleDOM}
									type="text"
									className="w-100"
									defaultValue={mapSelected.name}
								></Form.Control>
							</Form.Group>
						</div>
						<Button onClick={updateMap} disabled={!allowResourceSelection}>
							Guardar
						</Button>
					</Form.Group>
				</Form>
			) : (
				<></>
			)}

			{editVersionSelected ? (
				<Form
					className="container-fluid"
					action="#"
					method=""
					onSubmit={updateVersion}
				>
					<Form.Group className="mb-3">
						<div
							className="d-flex gap-2"
							role="button"
							onClick={() => setExpandedAside(!expandedAside)}
						>
							<div className="fw-bold">Contenido</div>
							<div>
								<div>
									{!expandedAside ? (
										<FontAwesomeIcon icon={faCaretUp} />
									) : (
										<FontAwesomeIcon icon={faCaretDown} />
									)}
								</div>
							</div>
						</div>
						<div
							style={{
								opacity: expandedAside ? "1" : "0",
								visibility: expandedAside ? "visible" : "hidden",
								maxHeight: expandedAside ? "" : "0",
								transition: "all .2s",
							}}
						>
							<Form.Group className="mb-3">
								<Form.Label className="mb-1">Nombre de la versión</Form.Label>
								<Form.Control
									id="version-title"
									ref={versionTitleDOM}
									type="text"
									className="w-100"
									defaultValue={editVersionSelected.name}
								></Form.Control>
							</Form.Group>
						</div>
						<Button onClick={updateVersion} disabled={!allowResourceSelection}>
							Guardar
						</Button>
					</Form.Group>
				</Form>
			) : (
				<></>
			)}
		</aside>
	);
}
