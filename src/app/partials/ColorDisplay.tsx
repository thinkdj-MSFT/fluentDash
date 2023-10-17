import './ColorDisplay.css';

export default function ColorDisplay (props:any) {

	const isColObj = props?.color?.theme ?? false;
	const color = props?.color?.value ?? props?.color ?? '#efefef';

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
				<div>-</div>
				}
			</div>
		</div>
	);
}
