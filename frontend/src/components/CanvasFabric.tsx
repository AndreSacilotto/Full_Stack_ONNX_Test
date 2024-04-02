import React, { useEffect, useRef, useState } from 'react'
import { FabricCanvas } from '@/util/FabricCanvas'

export interface CanvasFabricProps extends React.HTMLAttributes<HTMLCanvasElement>
{
	onCanvasResize?: (dimensions: { width: number, height: number }) => void,
	onCanvasRefChange?: (values: { canvasHTML: HTMLCanvasElement, canvasFabric: FabricCanvas } | null) => void,
	width?: number,
	height?: number,
}

export function CanvasFabric({ onCanvasRefChange, onCanvasResize, width, height, ...props }: CanvasFabricProps)
{
	const [canvasFabric, setCanvasFabric] = useState<FabricCanvas>()
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() =>
	{
		// console.log("fCanvas")
		const fCanvas = new FabricCanvas(canvasRef.current, {})
		setCanvasFabric(fCanvas);
		return () => { fCanvas.dispose(); }
	}, [canvasRef]);

	// enable use of the refs to the parent
	useEffect(() =>
	{
		onCanvasRefChange?.(canvasRef.current && canvasFabric ?
			{ canvasHTML: canvasRef.current, canvasFabric: canvasFabric } :
			null
		);
	}, [onCanvasRefChange, canvasFabric, canvasRef]);

	useEffect(() =>
	{
		if (!canvasFabric)
			return

		const w = width ?? canvasFabric.width ?? 0;
		const h = height ?? canvasFabric.height ?? 0;

		const dims = { width: w, height: h };
		canvasFabric.setDimensions(dims);
		onCanvasResize?.(dims);
		canvasFabric.renderAll();
	}, [canvasFabric, width, height, onCanvasResize])

	// const [selectedObjects, setSelectedObject] = useState<fabric.Object[]>([])
	// useEffect(() =>
	// {
	// 	if (!fabricCanvas)
	// 		return;
	// 	fabricCanvas.on('selection:cleared', setSelectEmpty)
	// 	fabricCanvas.on('selection:created', setSelect)
	// 	fabricCanvas.on('selection:updated', setSelect)
	// 	function setSelect(ev: fabric.IEvent<Event>) {
	// 		if(ev.selected)
	// 			setSelectedObject(ev.selected);
	// 	}
	// 	function setSelectEmpty() {
	// 		setSelectedObject([]);
	// 	}
	// 	return () => { 
	// 		fabricCanvas.off('selection:cleared', setSelectEmpty) 
	// 		fabricCanvas.off('selection:created', setSelect) 
	// 		fabricCanvas.off('selection:updated', setSelect) 
	// 	};
	// }, [fabricCanvas])

	return (<canvas {...props} ref={canvasRef} />);
}
