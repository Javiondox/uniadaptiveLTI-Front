import { useCallback, useContext } from "react";
import { Handle, Position } from "reactflow";
import { Badge } from "react-bootstrap";
import styles from "@components/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCube,
	faClipboardQuestion,
	faPenToSquare,
	faComments,
	faFile,
	faFolderOpen,
	faLink,
	faHandshakeAngle,
	faQuestion,
	faTag,
	faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import {
	BlockInfoContext,
	ExpandedContext,
	MapInfoContext,
	SettingsContext,
	VersionInfoContext,
} from "@components/pages/_app";

function getTypeIcon(type) {
	switch (type) {
		//Moodle + Sakai
		case "questionnaire":
			return <FontAwesomeIcon icon={faClipboardQuestion} />;
		case "assignment":
			return <FontAwesomeIcon icon={faPenToSquare} />;
		case "forum":
			return <FontAwesomeIcon icon={faComments} />;
		case "file":
			return <FontAwesomeIcon icon={faFile} />;
		case "folder":
			return <FontAwesomeIcon icon={faFolderOpen} />;
		case "url":
			return <FontAwesomeIcon icon={faLink} />;
		//Moodle
		case "workshop":
			return <FontAwesomeIcon icon={faHandshakeAngle} />;
		case "choice":
			return <FontAwesomeIcon icon={faQuestion} />;
		case "tag":
			return <FontAwesomeIcon icon={faTag} />;
		case "page":
			return <FontAwesomeIcon icon={faFileLines} />;
		//Sakai
		case "exam":
			return null;
		case "contents":
			return null;
		case "text":
			return null;
		case "html":
			return null;
		//LTI
		default:
			return <FontAwesomeIcon icon={faCube} />;
	}
}

function ElementNode({ id, xPos, yPos, type, data, isConnectable }) {
	const onChange = useCallback((evt) => {
		//console.log(evt.target.value);
	}, []);

	const { expanded, setExpanded } = useContext(ExpandedContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);

	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = parsedSettings;

	const handleClick = () => {
		const blockData = {
			id: id,
			x: xPos,
			y: yPos,
			type: type,
			title: data.label,
			children: data.children,
			identation: data.identation,
			conditions: data.conditions,
			order: data.order,
			unit: data.unit,
		};

		if (expanded != true) {
			if (type != "start" && type != "end") setExpanded(true);
		}

		setMapSelected("");
		setSelectedEditVersion("");
		setBlockSelected(blockData);
	};

	const getAriaLabel = () => {
		let end = "";
		if (data.unit && data.order) {
			end = data.unit
				? ", forma parte de la unidad " +
				  data.unit +
				  ", con la posición " +
				  data.order +
				  "en el LMS."
				: ".";
		}
		return (
			getHumanDesc() +
			", " +
			data.title +
			", posición en el eje X: " +
			xPos +
			", posición en el eje Y: " +
			yPos +
			end
		);
	};

	const getHumanDesc = (type) => {
		let humanType = "";
		switch (type) {
			//Moodle + Sakai
			case "questionnaire":
				humanType = "Cuestionario";
				break;
			case "assignment":
				humanType = "Tarea";
				break;
			case "forum":
				humanType = "Foro";
				break;
			case "file":
				humanType = "Archivo";
				break;
			case "folder":
				humanType = "Carpeta";
				break;
			case "url":
				humanType = "URL";
				break;
			//Moodle
			case "workshop":
				humanType = "Taller";
				break;
			case "choice":
				humanType = "Consulta";
				break;
			case "tag":
				humanType = "Etiqueta";
				break;
			case "page":
				humanType = "Página";
				break;
			case "generic":
				humanType = "Genérico";
				break;
			//Sakai
			case "exam":
				humanType = "Examen";
				break;
			case "contents":
				humanType = "Contenidos";
				break;
			case "text":
				humanType = "Texto";
				break;
			case "html":
				humanType = "HTML";
				break;
			//LTI
			default:
				humanType = "Elemento";
				break;
		}

		if (type == "start" || type == "end") return humanType + " del Mapa";
		return humanType;
	};

	return (
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
			onClick={handleClick}
			aria-label={getAriaLabel} //FIXME: Doesn't work
		>
			<span className={styles.blockInfo + " " + styles.top}>{data.label}</span>
			{process.env.DEV_MODE == true && (
				<>
					<div>{`id:${id}`}</div>
					<div>{`children:${data.children}`}</div>
				</>
			)}
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={isConnectable}
				isConnectableStart="false"
			/>
			<div>{getTypeIcon(type)}</div>
			<Handle
				type="source"
				position={Position.Right}
				isConnectable={isConnectable}
				isConnectableEnd="false"
			/>
			<span className={styles.blockInfo + " " + styles.bottom}>
				{getHumanDesc(type)}
			</span>
			{data.unit && (
				<Badge
					bg="light"
					className={
						styles.badge +
						" " +
						(reducedAnimations && styles.noAnimation) +
						" " +
						(showDetails && styles.showBadges) +
						" " +
						(highContrast && styles.highContrast)
					}
					title="Unidad"
				>
					{data.unit}
				</Badge>
			)}
			{data.order && (
				<Badge
					bg="warning"
					className={
						styles.badgeTwo +
						" " +
						(reducedAnimations && styles.noAnimation) +
						" " +
						(showDetails && styles.showBadges) +
						" " +
						(highContrast && styles.highContrast)
					}
					title="Posición en Moodle"
				>
					{data.order}
				</Badge>
			)}
		</div>
	);
}

export default ElementNode;
