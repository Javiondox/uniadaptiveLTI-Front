import { useCallback, useContext } from "react";
import { Handle, Position, NodeToolbar, useReactFlow } from "reactflow";
import styles from "@root/styles/BlockContainer.module.css";
import {
	NodeInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	SettingsContext,
	VersionInfoContext,
	PlatformContext,
} from "@root/pages/_app";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faRightFromBracket,
	faExclamation,
} from "@fortawesome/free-solid-svg-icons";
import FocusTrap from "focus-trap-react";
import { Button, Badge } from "react-bootstrap";
import { getTypeIcon } from "@utils/NodeIcons";
import { getUpdatedArrayById, parseBool } from "@utils/Utils";
import { getNodeById } from "@utils/Nodes";

const getHumanDesc = (type) => {
	let humanType = "";
	switch (type) {
		//Moodle + Sakai
		case "mail":
			humanType = "Enviar correo";
			break;
		case "addgroup":
			humanType = "Añadir a grupo";
			break;
		case "remgroup":
			humanType = "Eliminar grupo";
			break;
		//Moodle
		case "badge":
			humanType = "Dar Medalla";
			break;
		//Sakai
		//LTI
		default:
			humanType = "Elemento de Acción";
			break;
	}
	return humanType;
};

const getAriaLabel = () => {
	/*
	let end = blockData.section
		? ", forma parte de la sección " +
		  blockData.section +
		  ", calculado desde su identación."
		: ".";*/
	return (
		getHumanDesc() +
		", " +
		blockData.label +
		", posición en el eje X: " +
		blockData.x +
		", posición en el eje Y: " +
		blockData.y +
		end
	);
};

function ActionNode({ id, type, data, isConnectable }) {
	const onChange = useCallback((evt) => {
		//console.log(evt.target.value);
	}, []);

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { nodeSelected, setNodeSelected } = useContext(NodeInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(VersionInfoContext);

	const reactFlowInstance = useReactFlow();
	const { settings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { highContrast, reducedAnimations } = parsedSettings;
	const { platform } = useContext(PlatformContext);

	const handleEdit = () => {
		const blockData = getNodeById(id, reactFlowInstance.getNodes());
		if (expandedAside != true) {
			setExpandedAside(true);
		}
		setEditVersionSelected("");
		setNodeSelected(blockData);
	};

	const extractSelf = () => {
		const fragment = getNodeById(
			getNodeById(id, reactFlowInstance.getNodes()).parentNode,
			reactFlowInstance
		);
		const childToRemove = getNodeById(id, reactFlowInstance.getNodes());

		delete childToRemove.parentNode;
		delete childToRemove.expandParent;
		childToRemove.position = childToRemove.positionAbsolute;

		fragment.data.innerNodes = fragment.data.innerNodes.filter(
			(node) => node.id != childToRemove.id
		);
		fragment.zIndex = -1;
		reactFlowInstance.setNodes(
			getUpdatedArrayById(fragment, [
				...reactFlowInstance
					.getNodes()
					.filter((node) => childToRemove.id != node.id),
				childToRemove,
			])
		);
	};

	return (
		<>
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={isConnectable}
				isConnectableStart="false"
			/>
			<NodeToolbar position="left" offset={25}>
				<FocusTrap
					focusTrapOptions={{
						clickOutsideDeactivates: true,
						returnFocusOnDeactivate: true,
					}}
				>
					<div className={styles.blockToolbar}>
						<Button variant="dark" onClick={handleEdit} title="Editar acción">
							<FontAwesomeIcon icon={faEdit} />
							<span className="visually-hidden">Editar acción</span>
						</Button>
						{getNodeById(id, reactFlowInstance.getNodes()).parentNode && (
							<Button
								variant="dark"
								onClick={extractSelf}
								title="Sacar del fragmento"
							>
								<FontAwesomeIcon icon={faRightFromBracket} />
								<span className="visually-hidden">Sacar del fragmento</span>
							</Button>
						)}
					</div>
				</FocusTrap>
			</NodeToolbar>
			<div
				id={id}
				className={
					"block " +
					styles.container +
					" " +
					(highContrast && styles.highContrast + " highContrast ") +
					" " +
					(reducedAnimations && styles.noAnimation + " noAnimation")
				}
			>
				<span className={styles.blockInfo + " " + styles.top}>
					{data.label}
				</span>

				{parseBool(process.env.NEXT_PUBLIC_DEV_MODE) && (
					<div
						style={{
							position: "absolute",
							color: "black",
							left: "8em",
							top: "0",
							fontSize: "0.65em",
						}}
					>
						<div>{`id:${id}`}</div>
						<div>{`conditions:${JSON.stringify(data.conditions)}`}</div>
					</div>
				)}
				<div>{getTypeIcon(type, platform)}</div>
				<span className={styles.blockInfo + " " + styles.bottom}>
					{getHumanDesc(type)}
				</span>
				{!data.lmsResource && (
					<Badge
						bg="danger"
						className={
							styles.badge +
							" " +
							styles.badgeError +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							styles.showBadges +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Sección"
					>
						{
							<FontAwesomeIcon
								icon={faExclamation}
								style={{ color: "#ffffff" }}
							/>
						}
					</Badge>
				)}
			</div>
		</>
	);
}

export default ActionNode;
