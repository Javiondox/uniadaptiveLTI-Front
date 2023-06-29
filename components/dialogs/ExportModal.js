import { forwardRef, useContext, useLayoutEffect, useState } from "react";
import { Modal, Button, Container, Col, Row, Tabs, Tab } from "react-bootstrap";
import {
	PlatformContext,
	ExpandedAsideContext,
	NodeInfoContext,
	VersionInfoContext,
} from "@root/pages/_app";
import { NodeTypes } from "@utils/TypeDefinitions";
import {
	orderByPropertyAlphabetically,
	getNodeById,
	getParentsNode,
} from "@utils/Nodes";
import { uniqueId } from "@utils/Utils";
import { getTypeIcon, getTypeStaticColor } from "@utils/NodeIcons";
import styles from "@root/styles/ExportModal.module.css";
import { createItemErrors } from "@utils/ErrorHandling";
import { useReactFlow } from "reactflow";
import { useEffect } from "react";
import {
	faExclamationCircle,
	faExclamationTriangle,
	faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExportPanel from "@panes/exportmodal/ExportPanel";

export default forwardRef(function ExportModal(
	{
		showDialog,
		toggleDialog,
		metadata,
		userdata,
		errorList,
		metaData,
		mapName,
	},
	ref
) {
	const [key, setKey] = useState();

	const { platform } = useContext(PlatformContext);
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { nodeSelected, setNodeSelected } = useContext(NodeInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(VersionInfoContext);

	const reactFlowInstance = useReactFlow();

	const [warningList, setWarningList] = useState();
	const [tabsClassName, setTabsClassName] = useState();

	const [nodeErrorResourceList, setNodeErrorResourceList] = useState();
	const [nodeErrorSectionList, setNodeErrorSectionList] = useState();
	const [nodeErrorOrderList, setNodeErrorOrderList] = useState();

	const [nodeWarningChildrenList, setNodeWarningChildrenList] = useState();
	const [nodeWarningParentList, setNodeWarningParentList] = useState();

	const formatErrorList = () => {
		console.log(JSON.stringify(metadata));
	};

	const getErrorList = () => {
		const nodeArray = reactFlowInstance.getNodes();
		const nodeList = errorList.map((error) =>
			getNodeById(error.nodeId, nodeArray)
		);

		const nodeLIs = nodeList.map((node) => (
			<div key={node.id}>
				{/*<FontAwesomeIcon icon={faExclamationTriangle}></FontAwesomeIcon>*/}
				{getTypeIcon(node.type, platform, 16)} {node.data.label}
			</div>
		));
		const nodeUL = <div>{nodeLIs}</div>;
		setNodeErrorList(nodeUL);
	};

	function handleClose(actionClicked) {
		if (callback && actionClicked) {
			if (callback instanceof Function) {
				callback();
			} else {
				console.warn("Callback isn't a function");
			}
		}
		toggleDialog();
	}

	useLayoutEffect(() => {
		if (key) {
			const keyToClassMap = {
				error: "errorTabs",
				warning: "warningTabs",
				success: "successTabs",
			};

			const newTabsClassName = keyToClassMap[key] || "";
			setTabsClassName(newTabsClassName);
		}
	}, [key]);

	useLayoutEffect(() => {
		const warningList = generateWarningList(reactFlowInstance.getNodes());
		setWarningList(warningList);

		console.log("Error List: ", errorList);
		console.log("Warning List: ", warningList);

		const errorResourceNotFound = errorList
			.filter(
				(entry) =>
					entry.severity === "error" && entry.type === "resourceNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes()).data
					.label,
			}));

		const errorSectionNotFound = errorList
			.filter(
				(entry) =>
					entry.severity === "error" && entry.type === "sectionNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes()).data
					.label,
			}));

		const errorOrderNotFound = errorList
			.filter(
				(entry) => entry.severity === "error" && entry.type === "orderNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes()).data
					.label,
			}));

		const warningChildrenNotFound = warningList
			.filter(
				(entry) =>
					entry.severity === "warning" && entry.type === "childrenNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes()).data
					.label,
			}));

		const warningParentNotFound = warningList
			.filter(
				(entry) =>
					entry.severity === "warning" && entry.type === "parentNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes()).data
					.label,
			}));

		setNodeErrorResourceList(errorResourceNotFound);
		setNodeErrorSectionList(errorSectionNotFound);
		setNodeErrorOrderList(errorOrderNotFound);

		setNodeWarningChildrenList(warningChildrenNotFound);
		setNodeWarningParentList(warningParentNotFound);
	}, []);

	const handleEdit = (blockData) => {
		toggleDialog();
		if (expandedAside != true) {
			setExpandedAside(true);
		}
		setEditVersionSelected("");
		setNodeSelected(blockData);
	};

	function generateWarningList(nodeList) {
		const warningArray = [];
		nodeList.forEach((json) => {
			const errorEntry = {
				id: uniqueId(),
				nodeId: json.id,
			};

			if (
				json.type !== "remgroup" &&
				json.type !== "addgroup" &&
				json.type !== "fragment" &&
				json.type !== "mail" &&
				json.type !== "badge"
			) {
				if (
					(!json.data.children || json.data.children.length === 0) &&
					json.type !== "end"
				) {
					const customEntry = {
						...errorEntry,
						seriousness: "warning",
						type: "childrenNotFound",
					};

					const errorFound = warningArray.find(
						(obj) =>
							obj.nodeId === customEntry.nodeId &&
							obj.seriousness === customEntry.seriousness &&
							obj.type === customEntry.type
					);

					if (!errorFound) {
						warningArray.push(customEntry);
					}
				}

				const parentsNodeArray = getParentsNode(nodeList, json.id);

				if (parentsNodeArray.length <= 0 && json.type !== "start") {
					const customEntry = {
						...errorEntry,
						seriousness: "warning",
						type: "parentNotFound",
					};

					const errorFound = warningArray.find(
						(obj) =>
							obj.nodeId === customEntry.nodeId &&
							obj.seriousness === customEntry.seriousness &&
							obj.type === customEntry.type
					);

					if (!errorFound) {
						warningArray.push(customEntry);
					}
				}
			}
		});

		return warningArray;
	}

	const [warningCount, setWarningCount] = useState(
		warningList != undefined ? warningList.length : 0
	);
	const [hasWarnings, setHasWarnings] = useState(warningCount > 0);

	useLayoutEffect(() => {
		const count = warningList != undefined ? warningList.length : 0;
		setWarningCount(count);
		setHasWarnings(count > 0);
	}, [warningList]);

	return (
		<Modal show={showDialog} onHide={toggleDialog} centered>
			{
				<Modal.Header closeButton>
					<Modal.Title>Exportación</Modal.Title>
				</Modal.Header>
			}
			<Modal.Body>
				<Tabs
					defaultActiveKey="success"
					id="fill-tab-example"
					className={`${
						styles[
							`${tabsClassName == undefined ? "successTabs" : tabsClassName}`
						]
					} mb-3`}
					activeKey={key}
					onSelect={(k) => setKey(k)}
					fill
				>
					<Tab
						eventKey="success"
						className="border-success"
						title={
							<div className="text-success border-success">
								<FontAwesomeIcon icon={faFileExport}></FontAwesomeIcon>{" "}
								<a>Exportación</a>
							</div>
						}
					>
						<ExportPanel
							errorList={errorList}
							warningList={warningList}
							changeTab={setKey}
							metaData={metaData}
							mapName={mapName}
						/>
					</Tab>

					{errorList.length > 0 && (
						<Tab
							eventKey="error"
							className="border-danger"
							title={
								<div className="text-danger border-danger">
									<FontAwesomeIcon icon={faExclamationCircle}></FontAwesomeIcon>{" "}
									<a>Errores</a>
								</div>
							}
						>
							{nodeErrorResourceList && nodeErrorResourceList?.length > 0 && (
								<div className="mb-2">
									<div className="mb-2">
										<b>Los siguientes bloques no poseen un recurso asociado:</b>
									</div>
									{nodeErrorResourceList.map((entry) => {
										const node = getNodeById(
											entry.nodeId,
											reactFlowInstance.getNodes()
										);
										return (
											<div key={entry.id} onClick={() => handleEdit(node)}>
												<a role="button" className={styles.iconError}>
													{getTypeIcon(node.type, platform, 16)}
												</a>{" "}
												<a role="button" className={styles.nodeError}>
													{entry.nodeName}
												</a>
											</div>
										);
									})}
								</div>
							)}

							{nodeErrorSectionList && nodeErrorSectionList?.length > 0 && (
								<div className="mb-2">
									<div className="mb-2">
										<b>
											Los siguientes bloques no poseen una sección asignada:
										</b>
									</div>
									{nodeErrorSectionList.map((entry) => {
										const node = getNodeById(
											entry.nodeId,
											reactFlowInstance.getNodes()
										);
										return (
											<div key={entry.id} onClick={() => handleEdit(node)}>
												<a role="button" className={styles.iconError}>
													{getTypeIcon(node.type, platform, 16)}
												</a>{" "}
												<a role="button" className={styles.nodeError}>
													{entry.nodeName}
												</a>
											</div>
										);
									})}
								</div>
							)}

							{nodeErrorOrderList && nodeErrorOrderList?.length > 0 && (
								<div className="mb-2">
									<div className="mb-2">
										<b>Los siguientes bloques no poseen un orden asignado:</b>
									</div>
									{nodeErrorOrderList.map((entry) => {
										const node = getNodeById(
											entry.nodeId,
											reactFlowInstance.getNodes()
										);
										return (
											<div key={entry.id} onClick={() => handleEdit(node)}>
												<a role="button" className={styles.iconError}>
													{getTypeIcon(node.type, platform, 16)}
												</a>{" "}
												<a role="button" className={styles.nodeError}>
													{entry.nodeName}
												</a>
											</div>
										);
									})}
								</div>
							)}

							{/*JSON.stringify(metadata)*/}
							{/*JSON.stringify(userdata)*/}
						</Tab>
					)}

					{hasWarnings && (
						<Tab
							eventKey="warning"
							className="border-warning"
							title={
								<div className="text-warning border-warning">
									<FontAwesomeIcon
										icon={faExclamationTriangle}
									></FontAwesomeIcon>{" "}
									<a>Advertencias</a>
								</div>
							}
						>
							<div>
								{nodeWarningChildrenList != undefined &&
									nodeWarningChildrenList.length > 0 && (
										<div className="mb-2">
											<div className="mb-2">
												<b>
													Los siguientes bloques no poseen una salida a otro
													bloque:
												</b>
											</div>
											{nodeWarningChildrenList.map((entry) => {
												const node = getNodeById(
													entry.nodeId,
													reactFlowInstance.getNodes()
												);
												return (
													<div key={entry.id} onClick={() => handleEdit(node)}>
														<a role="button" className={styles.iconWarning}>
															{getTypeIcon(node.type, platform, 16)}
														</a>{" "}
														<a role="button" className={styles.nodeWarning}>
															{entry.nodeName}
														</a>
													</div>
												);
											})}
										</div>
									)}
							</div>
							<div>
								{nodeWarningParentList != undefined &&
									nodeWarningParentList.length > 0 && (
										<div className="mb-2">
											<div className="mb-2">
												<b>Los siguientes bloques no poseen un bloque padre:</b>
											</div>
											{nodeWarningParentList.map((entry) => {
												const node = getNodeById(
													entry.nodeId,
													reactFlowInstance.getNodes()
												);
												return (
													<div key={entry.id} onClick={() => handleEdit(node)}>
														<a role="button" className={styles.iconWarning}>
															{getTypeIcon(node.type, platform, 16)}
														</a>{" "}
														<a role="button" className={styles.nodeWarning}>
															{entry.nodeName}
														</a>
													</div>
												);
											})}
										</div>
									)}
							</div>
						</Tab>
					)}
				</Tabs>
			</Modal.Body>
			<Modal.Footer closeButton>
				<Button variant="secondary" onClick={toggleDialog}>
					Cerrar
				</Button>
			</Modal.Footer>
		</Modal>
	);
});
