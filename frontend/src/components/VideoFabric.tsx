import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import { FabricCanvas } from '@/util/FabricCanvas'

export interface VideoFabricProps extends React.MediaHTMLAttributes<HTMLVideoElement>
{
	canvas?: FabricCanvas,
	fitcanvas?: boolean,
	selectable?: boolean,
	onVideoResize?: (width: number, height: number) => void;
	onVideoRefChange?: (values: { videoHTML: HTMLVideoElement, videoFabric: fabric.Image } | null) => void,
}

export function VideoFabric({ canvas, selectable = true, fitcanvas = true, onVideoResize, onVideoRefChange, ...props }: VideoFabricProps)
{
	const [fabricImage, setFabricImage] = useState<fabric.Image>();
	const videoRef = useRef<HTMLVideoElement>(null);

	// resize the fabric.Video
	useEffect(() =>
	{
		const videoHTML = videoRef.current;
		if (!videoHTML)
			return;

		const setVideoSize = () =>
		{
			if (!fabricImage)
				return;

			// const videoHTML = fabricImage.getElement() as HTMLVideoElement;
			const w = videoHTML.videoWidth;
			const h = videoHTML.videoHeight;

			//https://github.com/fabricjs/fabric.js/issues/7063
			videoHTML.width = w;
			videoHTML.height = h;

			// setScale
			fabricImage.width = w;
			fabricImage.height = h;
			if (fitcanvas && canvas && canvas.width && canvas.height)
			{
				fabricImage.scaleX = canvas.width / w;
				fabricImage.scaleY = canvas.height / h;
			}
			fabricImage.setCoords();

			onVideoResize?.(w, h);
		}

		const canvasEl = canvas?.getElement();
		const ro = new ResizeObserver(setVideoSize);
		if (canvasEl)
			ro.observe(canvasEl)
		videoHTML.addEventListener("loadedmetadata", setVideoSize, true);
		return () =>
		{
			if (canvasEl)
				ro.unobserve(canvasEl)
			videoHTML.removeEventListener("loadedmetadata", setVideoSize)
		};
	}, [canvas, videoRef, fabricImage, onVideoResize, fitcanvas])

	// create the fabric.Video
	useEffect(() =>
	{
		const videoHTML = videoRef.current;
		if (!videoHTML || !canvas)
			return;

		const { object: ci } = canvas.addObject(new fabric.Image(videoHTML, {
			top: 0,
			left: 0,
			scaleX: 1,
			scaleY: 1,
			// width: canvas.width!,
			// height: canvas.height!,
			objectCaching: false,
			backgroundColor: "rgb(100, 100, 100)",
			name: "video",
		}));
		canvas.sendToBack(ci);
		setFabricImage(ci);

		const animCode = fabric.util.requestAnimFrame(function render()
		{
			// console.log("req");
			canvas?.renderAll();
			fabric.util.requestAnimFrame(render);
		});

		// console.log(videoHTML);
		// console.log(ci);

		return () =>
		{
			fabric.util.cancelAnimFrame(animCode);
			canvas?.remove(ci);
		};

	}, [canvas, videoRef])

	// make it (un)selectable
	useEffect(() =>
	{
		if (fabricImage)
		{
			fabricImage.selectable = selectable;
			fabricImage.evented = selectable;
		}
	}, [fabricImage, selectable])

	// enable use of the refs to the parent
	useEffect(() =>
	{
		onVideoRefChange?.(
			videoRef.current && fabricImage ?
				{ videoHTML: videoRef.current, videoFabric: fabricImage } :
				null
		);
	}, [videoRef, fabricImage, onVideoRefChange])

	return (<video ref={videoRef} {...props}>The browser does not support HTML5 video</video>);
}
