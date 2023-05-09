import styles from "@components/styles/Aside.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCaretDown,
	faCaretUp,
	faRotateRight,
	faCompress,
} from "@fortawesome/free-solid-svg-icons";
import { Container, Button, Form, Spinner } from "react-bootstrap";
import Qualification from "./flow/conditions/Qualification.js";
import { useState, useContext, useEffect, useRef, useId, version } from "react";
import {
	PlatformContext,
	BlockInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	VersionInfoContext,
	VersionJsonContext,
	SettingsContext,
	BlocksDataContext,
	ReactFlowInstanceContext,
} from "../pages/_app.js";
import { getUpdatedArrayById } from "./Utils.js";

export default function Aside({ className, closeBtn, svgExists }) {
	const [expandedContent, setExpandedContent] = useState(true);
	const [expandedAttr, setExpandedAttr] = useState(true);
	const [expandedInteract, setExpandedInteract] = useState(true);
	const [expandedRelations, setExpandedRelations] = useState(true);
	const [expandedCondition, setExpandedCondition] = useState(false);

	const [selectedOption, setSelectedOption] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const [allowResourceSelection, setAllowResourceSelection] = useState(true);

	const { platform, setPlatform } = useContext(PlatformContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);
	const { settings, setSettings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations, autoHideAside } = parsedSettings;

	//References
	const titleDOM = useRef(null);
	const optionsDOM = useRef(null);
	const conditionsDOM = useRef(null);
	const typeDOM = useRef(null);
	const mapTitleDOM = useRef(null);
	const versionTitleDOM = useRef(null);
	const refreshIconDOM = useRef(null);
	const relationSelectDOM = useRef(null);
	//IDs
	const titleID = useId();
	const optionsID = useId();
	const contentID = useId();
	//TODO: Add the rest

	const [secondOptions, setSecondOptions] = useState([]);
	const { versionJson, setVersionJson } = useContext(VersionJsonContext);
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { reactFlowInstance, setReactFlowInstance } = useContext(
		ReactFlowInstanceContext
	);

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);

	const conditionTypes = [
		{ id: 0, value: "qualification", name: "Calificación", default: "true" },
		{ id: 1, value: "finalization", name: "Finalización", default: "true" },
		{ id: 2, value: "userProfile", name: "Perfil de usuario", default: "true" },
	];

	const qualificationOperand = [
		{ id: 0, value: ">=", name: "Mayor o igual", default: "true" },
		{ id: 1, value: "<", name: "Menor", default: "true" },
		{ id: 2, value: "between", name: "Entre", default: "true" },
	];

	const [moodleResource, setMoodleResource] = useState([
		{ id: 0, value: "quiz", name: "Cuestionario" },
		{ id: 1, value: "assign", name: "Tarea" },
		{ id: 3, value: "workshop", name: "Taller" },
		{ id: 4, value: "choice", name: "Consulta" },
		{ id: 5, value: "forum", name: "Foro" },
		{ id: 6, value: "resource", name: "Archivo" },
		{ id: 7, value: "folder", name: "Carpeta" },
		{ id: 8, value: "label", name: "Etiqueta" },
		{ id: 9, value: "page", name: "Página" },
		{ id: 10, value: "url", name: "URL" },
		{ id: 11, value: "badge", name: "Medalla" },
		{ id: 12, value: "generic", name: "Genérico" },
		//{ id: 12, value: "fragment", name: "Fragmento"}
	]);

	const [sakaiResource, setSakaiResource] = useState([
		{ id: 0, value: "quiz", name: "Exámenes" },
		{ id: 1, value: "assign", name: "Tareas" },
		{ id: 3, value: "forum", name: "Foro" },
		{ id: 4, value: "resources", name: "Recursos" },
		{ id: 5, value: "resource", name: "Archivo" },
		{ id: 6, value: "folder", name: "Carpeta" },
		{ id: 7, value: "url", name: "URL" },
		{ id: 8, value: "page", name: "Página" },
		{
			id: 9,
			value: "resource",
			name: "Documento de texto simple",
		},
		{ id: 10, value: "html-page", name: "Página HTML" },
		//{ id: 11, value: "fragment", name: "Fragmento}
	]);

	useEffect(() => {
		switch (selectedOption) {
			case "quiz":
				setSecondOptions([
					{ id: 0, name: "Cuestionario 1" },
					{ id: 1, name: "Cuestionario 2" },
					{ id: 2, name: "Cuestionario 3" },
				]);
				break;
			case "assign":
				setSecondOptions([
					{ id: 0, name: "Tarea 1" },
					{ id: 1, name: "Tarea 2" },
					{ id: 2, name: "Tarea 3" },
				]);
				break;
			case "workshop":
				setSecondOptions([
					{ id: 0, name: "Taller 1" },
					{ id: 1, name: "Taller 2" },
					{ id: 2, name: "Taller 3" },
				]);
				break;
			case "choice":
				setSecondOptions([
					{ id: 0, name: "Consulta 1" },
					{ id: 1, name: "Consulta 2" },
					{ id: 2, name: "Consulta 3" },
				]);
				break;
			case "forum":
				setSecondOptions([
					{ id: 0, name: "Foro 1" },
					{ id: 1, name: "Foro 2" },
					{ id: 2, name: "Foro 3" },
				]);
				break;
			case "resource":
				setSecondOptions([
					{ id: 0, name: "Archivo 1" },
					{ id: 1, name: "Archivo 2" },
					{ id: 2, name: "Archivo 3" },
				]);
				break;
			case "folder":
				setSecondOptions([
					{ id: 0, name: "Carpeta 1" },
					{ id: 1, name: "Carpeta 2" },
					{ id: 2, name: "Carpeta 3" },
				]);
				break;
			case "label":
				setSecondOptions([
					{ id: 0, name: "Etiqueta 1" },
					{ id: 1, name: "Etiqueta 2" },
					{ id: 2, name: "Etiqueta 3" },
				]);
				break;
			case "page":
				setSecondOptions([
					{ id: 0, name: "Página 1" },
					{ id: 1, name: "Página 2" },
					{ id: 2, name: "Página 3" },
				]);
				break;
			case "url":
				setSecondOptions([
					{ id: 0, name: "Url 1" },
					{ id: 1, name: "Url 2" },
					{ id: 2, name: "Url 3" },
				]);
				break;
			case "badge":
				setSecondOptions([
					{ id: 0, name: "Medalla 1" },
					{ id: 1, name: "Medalla 2" },
					{ id: 2, name: "Medalla 3" },
				]);
				break;
			case "generic":
				setSecondOptions([{ id: 0, name: "Genérico" }]);
				break;
			default:
				setSecondOptions([]);
				break;
		}
	}, [selectedOption]);

	const handleSelect = (event) => {
		setShowSpinner(true);

		let input = optionsDOM.current;
		setSelectedOption(event.target.value);
		setAllowResourceSelection(false);

		let refresh = refreshIconDOM.current;
		refresh.classList.add("d-none");
		input.disabled = true;

		setTimeout(() => {
			refresh.classList.remove("d-none");
			input.disabled = false;
			setShowSpinner(false);
			setAllowResourceSelection(true);
		}, 2000);
	};

	useEffect(() => {
		if (blockSelected) {
			let newBlock = currentBlocksData.find(
				(block) => block.id == blockSelected.id
			);
			if (newBlock) {
				setBlockSelected(newBlock);
			}
		}
	}, [currentBlocksData]);

	useEffect(() => {
		if (blockSelected) {
			const title = titleDOM.current;
			const type = typeDOM.current;
			const selectElement = relationSelectDOM.current;
			const optionToSelect = selectElement?.querySelector('option[value=""]');

			if (title) {
				title.value = blockSelected.title;
			}

			if (type) {
				type.value = blockSelected.type;
			}

			if (optionToSelect) {
				optionToSelect.selected = true;
				setMatchingConditions();
				setExpandedCondition(false);
				setShowConditions(false);
				setSelectedOption(blockSelected.type);

				const condition = conditionsDOM.current;

				if (condition) {
					condition.value = blockSelected.conditions;
				}
			}
		}
	}, [blockSelected]);

	/**
	 * Updates the selected block with the values from the specified DOM elements.
	 */
	const updateBlock = () => {
		console.log(blockSelected);
		reactFlowInstance.setNodes(
			getUpdatedArrayById(
				{
					...blockSelected,
					...{
						id: blockSelected.id,
						type: typeDOM.current.value,
						data: {
							label: titleDOM.current.value,
							resource: optionsDOM.current.value,
							children: blockSelected.children,
							identation: blockSelected.identation,
						},
					},
				},
				reactFlowInstance.getNodes()
			)
		);

		/*setCurrentBlocksData(
			getUpdatedBlocksData(
				{
					id: blockSelected.id,
					x: blockSelected.x,
					y: blockSelected.y,
					type: typeDOM.current.value,
					title: titleDOM.current.value,
					resource: optionsDOM.current.value,
					children: blockSelected.children,
					identation: blockSelected.identation,
				},
				currentBlocksData
			)
		);*/
		if (autoHideAside) {
			setExpandedAside(false);
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
			id: selectedEditVersion.id,
			name: versionTitleDOM.current.value,
			lastUpdate: selectedEditVersion.lastUpdate,
			default: selectedEditVersion.default,
		}));
	};

	/**
	 * Collapses the side panel.
	 */
	function collapseAside() {
		setExpandedAside(false);
	}

	const [showConditions, setShowConditions] = useState(false);
	const [matchingConditions, setMatchingConditions] = useState();

	const handleBlockSelect = (event) => {
		const blockId = event.target.value;
		if (blockId === "") {
			setShowChildSelect(false);
			setSelectedChild(null);
			setConditions([]);
		} else {
			if (blockSelected.conditions) {
				const matchingConditions = blockSelected.conditions.filter(
					(condition) => condition.unlockId === blockId
				);
				setExpandedCondition(true);
				setShowConditions(true);
				setMatchingConditions(matchingConditions);
			} else {
				setExpandedCondition(true);
				setShowConditions(true);
				setMatchingConditions();
			}
		}
	};

	const handleChildSelect = (event) => {
		const childId = event.target.value;
		setSelectedChild(childId);
	};
	return (
		<aside className={`${className} ${styles.aside}`}>
			{/* TODO: FocusTrap this */}
			<div className={"text-center p-2"}>
				<div
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
						src={process.env.LOGO_PATH}
						style={{ width: "100%" }}
					/>
					<span className={styles.collapse + " display-6"}>
						<FontAwesomeIcon width={38} height={38} icon={faCompress} />
					</span>
				</div>
				<hr />
				<div id={mapSelected?.id}></div>
			</div>

			{blockSelected &&
			!(blockSelected.type == "start" || blockSelected.type == "end") ? (
				<Form
					action="#"
					method=""
					onSubmit={allowResourceSelection ? updateBlock : null}
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
									<Form.Label htmlFor={titleID} className="mb-1">
										Nombre del contenido
									</Form.Label>
									<Form.Control
										ref={titleDOM}
										id={titleID}
										type="text"
										className="w-100"
									></Form.Control>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label htmlFor={contentID} className="mb-1">
										Tipo de contenido
									</Form.Label>
									<Form.Select
										ref={typeDOM}
										id={contentID}
										className="w-100"
										defaultValue={selectedOption}
										onChange={handleSelect}
									>
										{platform == "moodle"
											? moodleResource.map((option) => (
													<option key={option.id} value={option.value}>
														{option.name}
													</option>
											  ))
											: sakaiResource.map((option) => (
													<option key={option.id} value={option.value}>
														{option.name}
													</option>
											  ))}
									</Form.Select>
								</Form.Group>

								{blockSelected.type != "fragment" ? (
									<div className="mb-3">
										<div className="d-flex gap-2">
											<Form.Label htmlFor={optionsID} className="mb-1">
												Recurso en el LMS
											</Form.Label>
											<div className="d-flex">
												<div ref={refreshIconDOM} id="refresh-icon">
													<FontAwesomeIcon icon={faRotateRight} />
												</div>
												<div>
													{showSpinner && (
														<Spinner animation="border" role="status" size="sm">
															<span className="visually-hidden">
																Loading...
															</span>
														</Spinner>
													)}
												</div>
											</div>
										</div>
										<Form.Select
											ref={optionsDOM}
											id={optionsID}
											className="w-100"
										>
											{allowResourceSelection &&
												secondOptions.map((option) => (
													<option key={option.id} value={option.name}>
														{option.name}
													</option>
												))}
										</Form.Select>
									</div>
								) : (
									<></>
								)}
							</div>
						</Form.Group>

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
								<Form.Group>
									<Form.Label className="mb-1">Visibilidad</Form.Label>
									<Form.Select>
										<option>Ocultar hasta tener acceso</option>
										<option>Mostrar siempre sin acceso</option>
									</Form.Select>
								</Form.Group>
							</div>
						</div>
						{blockSelected.children && (
							<div>
								<div className="mb-2">
									<div
										className="d-flex gap-2"
										role="button"
										onClick={() => {
											setExpandedRelations(!expandedRelations);
											setExpandedCondition(false);
										}}
									>
										<div className="fw-bold">Relaciones</div>
										<div>
											<div role="button">
												{!expandedRelations ? (
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
											expandedRelations ? styles.active : null,
											reducedAnimations && styles.noAnimation,
										].join(" ")}
									>
										<Form.Select
											ref={relationSelectDOM}
											className="mb-3"
											onChange={handleBlockSelect}
											defaultValue={""}
										>
											<option value="" disabled>
												Escoge una relación
											</option>

											{blockSelected.children &&
												blockSelected.children.map((childId) => {
													const selectedChild = reactFlowInstance
														.getNodes()
														.find((child) => child.id === childId);

													return (
														<option
															key={selectedChild.id}
															value={selectedChild.id}
														>
															{selectedChild.title}
														</option>
													);
												})}
										</Form.Select>
										{showConditions && (
											<div className="mb-2">
												<div
													className="d-flex gap-2"
													role="button"
													onClick={() =>
														setExpandedCondition(!expandedCondition)
													}
												>
													<div className="fw-bold">Condición</div>
													<div>
														<div role="button">
															{!expandedCondition ? (
																<FontAwesomeIcon icon={faCaretUp} />
															) : (
																<FontAwesomeIcon icon={faCaretDown} />
															)}
														</div>
													</div>
												</div>
												{matchingConditions &&
													matchingConditions.map((condition) => {
														if (condition.type === "qualification") {
															return (
																<Qualification
																	condition={condition}
																	conditionTypes={conditionTypes}
																	qualificationOperand={qualificationOperand}
																	titleID={titleID}
																	titleDOM={titleDOM}
																	expandedCondition={expandedCondition}
																/>
															);
														}
													})}
											</div>
										)}
									</div>
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

			{mapSelected && !(blockSelected || selectedEditVersion) ? (
				<div className="container-fluid">
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
				</div>
			) : (
				<></>
			)}

			{selectedEditVersion ? (
				<div className="container-fluid">
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
									defaultValue={selectedEditVersion.name}
								></Form.Control>
							</Form.Group>
						</div>
						<Button onClick={updateVersion} disabled={!allowResourceSelection}>
							Guardar
						</Button>
					</Form.Group>
				</div>
			) : (
				<></>
			)}
		</aside>
	);
}
