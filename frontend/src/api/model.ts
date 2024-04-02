export function getModelAddress()
{
	return import.meta.env.VITE_MODEL_ADDRESS;
}

// */ping (GET)

export async function ping() {
	try{		
		const response = await fetch(getModelAddress() + "/ping", { method: "GET", });
		if(!response.ok)
			throw new Error(`Bad response from server: ${response.status}`);
		const value = await response.text();
		return { response, value: value === "pong" }
	}
	catch(error){
		console.error(error);
	}
}

// */detect (POST)
export interface DetectRequest
{
	file_time: number | -1,
	file_name: string,
	image_info: string,
	format: "path" | "b64",
	confidence: string | number,
	iou: string | number,
}
export type DetectResponse = DetectPrediction[]
export interface DetectPrediction {
  box: BBox,
  class_name: string,
  confidence: number,
}
export interface BBox {
  height: number,
  left: number,
  top: number,
  width: number,
}

export async function detect(requestBody: DetectRequest)
{
	try{
		const response = await fetch(getModelAddress() + "/detect", { method: "POST",
			body: JSON.stringify(requestBody),
			headers: { "Content-type": "application/json; charset=UTF-8" }
		});
		if(!response.ok)
			throw new Error(`Bad response from server: ${response.status}`);

		const values = await response.json() as DetectResponse;
		
		return { response, values };
	}
	catch(error){
		console.error(error);
	}
}

// */model_check (GET)

export async function modelCheck()
{
	try{		
		const response = await fetch(getModelAddress() + "/model_check", { method: "GET", });
		if(!response.ok)
			throw new Error(`Bad response from server: ${response.status}`);

		const value = await response.json() as [string, boolean];
	
		return { response, value }
	}
	catch(error){
		console.error(error);
	}
}

// */models_list (GET)

export async function modelsList()
{
	try{		
		const response = await fetch(getModelAddress() + "/models_list", { method: "GET", });
		if(!response.ok)
			throw new Error(`Bad response from server: ${response.status}`);

		const values = await response.json() as string[];
	
		return { response, values }
	}
	catch(error){
		console.error(error);
	}
}

// */load_model (POST)
interface LoadModelRequest
{
	model_name: string | "yolov8n" | "yolov8s",
}

export async function loadModel(requestBody: LoadModelRequest)
{
	try{
		const response = await fetch(getModelAddress() + "/load_model", { method: "POST",
			body: JSON.stringify(requestBody),
			headers: { "Content-type": "application/json; charset=UTF-8" }
		});
		if(!response.ok)
			throw new Error(`Bad response from server: ${response.status}`);

		const value = await response.text();
		
		return { response, value }
	}
	catch(error){
		console.error(error);
	}
}