import Head from "next/head";
import { useContext } from "react";
import { BlocksDataContext } from "./_app";
import BlockFlow from "@root/components/BlockFlow";
import Layout from "../components/Layout";

export default function Home() {
	const { currentBlocksData } = useContext(BlocksDataContext);
	return (
		<>
			<Head>
				<title>UNI Adaptive</title>
				<meta name="description" content="Uniadaptive LTI tool" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href={process.env.NEXT_PUBLIC_FAVICONx180_PATH}
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href={process.env.NEXT_PUBLIC_FAVICONx32_PATH}
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href={process.env.NEXT_PUBLIC_FAVICONx16_PATH}
				/>
				<link rel="manifest" href="/site.webmanifest" />
			</Head>
			<Layout>
				{currentBlocksData ? (
					<BlockFlow map={currentBlocksData}></BlockFlow>
				) : (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "100%",
						}}
					>
						<h1>No se ha seleccionado ningún mapa</h1>
					</div>
				)}
			</Layout>
		</>
	);
}
