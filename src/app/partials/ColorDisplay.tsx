import './ColorDisplay.css';

export default function ColorDisplay (props:any) {

	const isColObj = props?.color?.theme ?? false;
	const color = props?.color?.value ?? props?.color ?? '#efefef';

	function hexToRGBA(hex: string, alpha: number): string {
		hex = hex.replace(/^#/, '');

		if (hex.length === 3) {
			hex = hex.split('').map(char => char + char).join('');
		}

		const bigint = parseInt(hex, 16);
		const r = (bigint >> 16) & 255;
		const g = (bigint >> 8) & 255;
		const b = bigint & 255;

		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	return (
		<div className={`cdContainer`}>
			<span className="colorDisplayBlock" style={{backgroundColor:color}}></span>
			<div>
				{color} <br />
				{ isColObj ?
				<div>
					{props?.color?.theme??''} &rarr; {props?.color?.token??''}
				</div>
				:
				<div>{hexToRGBA(color,0)}</div>
				}
			</div>
		</div>
	);
}
