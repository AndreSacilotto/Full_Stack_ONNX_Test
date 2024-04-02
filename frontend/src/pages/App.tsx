import { useEffect, useState } from "react";
import { fabric } from "fabric";
import { FloatSlider } from "@/components/FloatSlider";
import { CanvasFabric } from "@/components/CanvasFabric";
import { VideoInputField } from "@/components/VideoInputField";
import { PredictionTable } from "@/components/PredictionTable";
import { VideoFabric } from "@/components/VideoFabric";
import { FabricCanvas, dataUrlRemoveInfo } from "@/util/FabricCanvas";
import * as model from "@/api/model";

export default function App()
{
	const [canvas, setCanvas] = useState<FabricCanvas>();
	// const [videoRef, setVideoRef] = useState<HTMLVideoElement>();

	const [modelInfo, setModelInfo] = useState<{ list: string[], current: string }>({ list: [], current: "" });
	const [currentModel, setModel] = useState({ confidence: 0.7, iou: 0.5, });
	const [videoSrc, setVideoSrc] = useState<string>("");
	const [dataRows, setDataRows] = useState<string[][]>(new Array(10).fill([" ", " "]));
	const [rtt, setRtt] = useState(0);
	const [videoPlaying, setVideoPlaying] = useState(false);
	const [videoRef, setVideoRef] = useState<HTMLVideoElement>();
	const [canvasDimensions, setCanvasDimensions] = useState<{ width: number, height: number }>({ width: Math.floor(window.innerWidth / 2), height: Math.floor(window.innerHeight / 2) });

	// ping the server
	// useInterval(async () =>
	// {
	// 	const t0 = new Date().getTime();
	// 	await model.ping();
	// 	const t1 = new Date().getTime();
	// 	const newRtt = t1 - t0;
	// 	setRtt(newRtt);
	// }, 2000, true)

	useEffect(() =>
	{
		load();
		async function load()
		{
			// load model info
			const ml = await model.modelsList();
			let list: string[] = [];
			if (ml && ml.values)
				list = ml.values;
			const mc = await model.modelCheck();
			let current = "";
			if (mc && mc.value && mc.value[1])
				current = mc.value[0];
			setModelInfo({ list, current });
		}
	}, []);

	async function loadModel(modelName: string)
	{
		const res = await model.loadModel({ model_name: modelName });
		if (res)
		{
			console.log(res.value)
			setModelInfo({ ...modelInfo, current: modelName })
		}
		else
			console.warn("error on loading model")
	}

	function fabricBBox(box: model.BBox, text: string)
	{
		const fontSize = 16;
		return new fabric.Group([
			new fabric.Rect({
				left: box.left,
				top: box.top,
				width: box.width,
				height: box.height,
				fill: "rgba(0, 0, 0, 0.0)",
				stroke: "red",
				strokeWidth: 2,
			}),
			// new fabric.Rect({
			// 	left: box.left,
			// 	top: box.top,
			// 	width: box.width,
			// 	height: fontSize + 1,
			// 	fill: "red",
			// 	stroke: "red",
			// }),
			new fabric.Text(text, {
				textBackgroundColor: "red",
				textAlign: "center",
				width: box.width,
				left: box.left,
				top: box.top,
				fontSize: fontSize,
				stroke: "white",
			})
		],
			{
				selectable: false,
				// evented: false,
			});
	}

	async function videoStep(videoHTML: HTMLVideoElement)
	{
		videoHTML.pause();
		if (!canvas)
			return;

		const time = videoHTML.currentTime;
		const dataUrl = canvas.takePrintPNG();

		const t0 = new Date().getTime();
		const res = await model.detect({ file_time: time, file_name: videoSrc, image_info: dataUrlRemoveInfo(dataUrl), format: "b64", ...currentModel });
		const t1 = new Date().getTime();
		const diff = t1 - t0;
		setRtt(diff);

		if (!res)
		{
			console.warn(`response is ${res}`);
			return;
		}

		canvas.getObjects().forEach(x =>
		{
			if (x.type !== "image")
				canvas.remove(x)
		})

		if (res.values.length > 0)
		{
			const groups: fabric.Group[] = res.values.map(x => fabricBBox(x.box, `${x.class_name} ${x.confidence.toFixed(2)}`));
			canvas.add(...groups);
			canvas.renderAll();
		}

		const newRow = [
			videoHTML.currentTime.toString(),
			res.values.map(x =>
				`${x.class_name} ${x.confidence.toFixed(4)} ${JSON.stringify(x.box)}`
			).join("\n")
		];
		setDataRows([newRow, ...dataRows.slice(0, 9)]);

		if (videoPlaying)
			videoHTML.play();
	}

	function videoPlay()
	{
		const newState = !videoPlaying;
		if (newState)
			videoRef?.play();
		else
			videoRef?.pause();
		setVideoPlaying(newState);
	}

	return (
		<div className="grid grid-cols-[1fr_2fr] gap-4">

			<div className="flex flex-col justify-center gap-4 border-2 rounded-md p-3">
				<div className="bg-neutral text-neutral-content w-fit px-4 py-2 rounded-xl">Ping: {rtt}</div>
				<VideoInputField
					className="file-input file-input-bordered w-full max-w-xs"
					onValueChange={(x) => setVideoSrc(x.dataUrl)}
				/>
				<button className="btn btn-primary"
					onClick={() => { canvas?.getObjects().forEach(x => console.log(x)) }}>Log</button>

				<select name="models" value={modelInfo.current} onChange={(ev) => loadModel(ev?.target.value)}
					className="select select-sm select-bordered w-full"
				>
					{modelInfo.list.map(m => (<option key={m} value={m}>{m}</option>))}
				</select>
				<label>
					<span>Confidance</span>
					<FloatSlider name="Confidance:" initialValue={currentModel.confidence} onValueChange={(x) => setModel({ ...currentModel, confidence: x.newValue })}
						className="w-full px-10"
					/>
				</label>
				<label>
					<span>IoU</span>
					<FloatSlider name="IoU:" initialValue={currentModel.iou} onValueChange={(x) => setModel({ ...currentModel, iou: x.newValue })}
						className="w-full px-10"
					/>
				</label>
			</div>

			<div className="flex flex-col justify-between items-center">
				<VideoFabric canvas={canvas} className="border border-red-200"
					selectable={false} fitcanvas={true} src={videoSrc}
					onTimeUpdate={(ev) => videoStep(ev.target as HTMLVideoElement)}
					onVideoRefChange={(ev) => setVideoRef(ev?.videoHTML)}
					muted
					controls={!videoPlaying}
				/>
				<button className="btn btn-primary w-1/2" onClick={videoPlay}>{videoPlaying ? "Stop" : "Play"}</button>
			</div>

			<div className="col-span-2 flex justify-center relative">
				<CanvasFabric width={canvasDimensions.width} height={canvasDimensions.height} onCanvasRefChange={(x) => setCanvas(x?.canvasFabric)}
					className="border"
				/>
				<div className="absolute flex flex-col gap-1 top-0 left-0">
					<label className="input input-bordered p-0 pl-2 flex items-center">
						<span className="border-r pr-2">Width</span>
						<input type="number" step={1} className="grow w-14 pl-2" 
							value={canvasDimensions.width} onChange={(ev) => setCanvasDimensions({ ...canvasDimensions, width: Number(ev.target.value) })}
						/>
					</label>
					<label className="input input-bordered pl-2 flex items-center">
						<span className="border-r pr-2">Height</span>
						<input type="number" step={1} className="grow max-w-14 pl-2"
							value={canvasDimensions.height} onChange={(ev) => setCanvasDimensions({ ...canvasDimensions, height: Number(ev.target.value) })}
						/>
					</label>
				</div>
			</div>

			<div className="col-span-2 border-2 p-1 overflow-scroll w-full">
				<PredictionTable
					className="table table-zebra text-center w-full"
					classNameTHead=""
					classNameTBody=""
					classNameTData="whitespace-pre"
					headerEntries={["Time", "Value"]}
					bodyEntries={dataRows}
				/>
			</div>

		</div>
	);
}