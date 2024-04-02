
export interface VideoInputFieldProps extends Omit<React.HTMLAttributes<HTMLInputElement>, "type" | "accept" | "onChange">
{
	onValueChange?: (value: { file: File, dataUrl: string}) => void,
}

export function VideoInputField({onValueChange, ...props }: VideoInputFieldProps) 
{
	// const [current, setCurrent] = useState<FileCallbackParams>();

	function setCurrentFn(ev : React.ChangeEvent<HTMLInputElement>) {
		// console.log(ev, ev.target!.files);

		if(!ev.target.files)
			return;

		const file = ev.target.files[0];
		const dataUrl = URL.createObjectURL(file);

		// setCurrent(params);
		onValueChange?.({file, dataUrl});
	}

	return (<input type="file" accept="audio/ogg,video/*" onChange={setCurrentFn} {...props} />)
}
