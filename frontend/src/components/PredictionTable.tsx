
export interface PredictionTableProps extends React.HTMLAttributes<HTMLTableElement>
{
	headerEntries?: string[],
	bodyEntries?: string[][],

	classNameTHead?: string,
	classNameTBody?: string,
	classNameTData?: string,
	classNameTHeader?: string,
}

export function PredictionTable({ headerEntries, bodyEntries, classNameTHead, classNameTBody, classNameTData, classNameTHeader, ...props }: PredictionTableProps) 
{
	return (
		<table {...props}>
			<thead className={classNameTHead}>
				<tr>
					{headerEntries?.map(header => (
						<th key={header} scope="col" className={classNameTHeader}>{header}</th>
					))}
				</tr>
			</thead>
			<tbody className={classNameTBody}>
				{bodyEntries?.map((row, i1) => (
					<tr key={generateRandomKey(i1)}>
						{row.map((str, i2) => (
							<td key={generateRandomKey(i2)} className={classNameTData}>{str}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	)
}

// better than using just index, but not ideal
function generateRandomKey(seed: number)
{
	return Math.random() * 1000 * seed;
}