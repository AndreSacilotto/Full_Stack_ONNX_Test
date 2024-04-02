
import React, { useState } from 'react'
import { twMerge } from 'tailwind-merge'

export interface FloatSliderProps extends React.HTMLAttributes<HTMLDivElement>
{
	name?: string,
	min?: number,
	max?: number,
	step?: number,
	initialValue?: number,
	onValueChange?: (values: {oldValue: number, newValue: number}) => void,
}

export function FloatSlider({ name, onValueChange, min = 0, max = 1, step = 0.01, initialValue, className, ...props }: FloatSliderProps) 
{
	const [current, setCurrent] = useState(initialValue || min);

	function setCurrentFn(ev : React.ChangeEvent<HTMLInputElement>) {
		const oldValue = current;
		const newValue = Number(ev.target.value)
		setCurrent(newValue);
		onValueChange?.({ oldValue, newValue });
	}

	return (
		<div {...props} className={twMerge("grid grid-cols-3 grid-rows-[2rem_2rem]", className)}>
			<input type="range" name={name}
				min={min} max={max} step={step} value={current} 
				onChange={setCurrentFn} 
				className="col-span-3 range range-sm"
			/>
			<div className="text-left">{min}</div>
			<div className="text-center">{current}</div>
			<div className="text-right">{max}</div>
		</div>
	)
}
