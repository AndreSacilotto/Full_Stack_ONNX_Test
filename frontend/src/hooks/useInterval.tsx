import { useEffect } from "react";

export function useInterval(callback: () => void, interval: number, running = true)
{
	useEffect(() =>
	{
		if(!running)
			return;
		const id = setInterval(callback, interval)
		return () => { 
			clearTimeout(id);
			// console.log("delete");
		}
	}, [callback, interval, running]);
}