import { fabric } from 'fabric';

export class FabricCanvas extends fabric.Canvas
{
	constructor(element: HTMLCanvasElement | string | null, options?: fabric.ICanvasOptions)
	{
		super(element, options);
	}

	//#region FABRIC OBJECTS

	// VALID OBJECTS: Circle, Rect, Ellipse, Group, Image, Image.fromURL, Image.fromElement, Line, Path, Polyline, Text, Textbox, Triangle
	public addObject<T extends fabric.Object>(object: T)
	{
		const staticCanvas = this.add(object);
		return { staticCanvas, object };
	}

	//#region FABRIC UTIL
	public selectionUpdateText(text: string)
	{
		const objects = this.getActiveObjects();
		objects.filter(x => x.type === "text").forEach(x => (x as fabric.IText).set({ text }));
		this.renderAll();
	}

	public removeAllObjects()
	{
		this.getObjects().forEach((x) => this.remove(x));
		this.discardActiveObject();
		this.renderAll();
	}

	public selectionRemove()
	{
		this.getActiveObjects().forEach((x) => this.remove(x));
		this.discardActiveObject();
		this.renderAll();
	}

	public selectionSetFillColor(fill: string)
	{
		this.getActiveObjects().forEach((x) => x.set({ fill }));
		this.renderAll();
	}

	public selectionSetStrokeColor(stroke: string)
	{
		this.getActiveObjects().forEach((x) =>
		{
			if (x.type === "text")
				x.set({ fill: stroke });
			else
				x.set({ stroke });
		});
		this.renderAll();
	}
	//#endregion
	
	public recursiveRequestAnimFrame()
	{
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const canvas = this;
		return fabric.util.requestAnimFrame(function render()
		{
			canvas.renderAll();
			fabric.util.requestAnimFrame(render);
		});
	}

	public takePrintPNG(options?: Omit<fabric.IDataURLOptions, "format" | "quality">)
	{
		const dataUrl = this.toDataURL({ format: "png", ...options });
		return dataUrl;
	}

	public takePrintJPEG(options?: Omit<fabric.IDataURLOptions, "format">)
	{
		const dataUrl = this.toDataURL({ format: "jpeg", ...options });
		return dataUrl;
	}
}


export function dataUrlToBlob(dataUrl: string){
	const blob = new Blob([dataUrl], {type: "octet/stream"});
	const blobUrl = URL.createObjectURL(blob);
	return { blob, blobUrl };
}

export function dataUrlRemoveInfo(dataURL: string) {
	return dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
}
