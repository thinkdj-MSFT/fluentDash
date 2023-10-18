import * as React from "react";
import {
	TableBody,
	TableCell,
	TableCellLayout,
	TableHeader,
	TableHeaderCell,
	TableRow,
	Table,
	Avatar,
} from "@fluentui/react-components";
import ColorDisplay from "@/app/partials/ColorDisplay";

type Item = {
	token: string;
	theme: string;
	color: string;
};

const columns = [
	{ key: "token", name: "Token", isSortable: true },
	{ key: "theme", name: "Theme", isSortable: true },
	{ key: "color", name: "Color", isSortable: true },
];

export const TableView = (props:any) => {

	const items: Item[] = props?.data ?? [];

	const [sortColumn, setSortColumn] = React.useState("token");
	const [sortDirection, setSortDirection] = React.useState<"ascending"|"descending"|undefined>("ascending");

	const handleSort = (columnKey: string) => {
		if (columnKey === sortColumn) {
			setSortDirection(sortDirection === "ascending" ? "descending" : "ascending");
		} else {
			setSortColumn(columnKey);
			setSortDirection("ascending");
		}
	};

	const sortedItems = React.useMemo(() => {
		const sorted = [...items].sort((a, b) => {
			const aValue = a[sortColumn].toLowerCase();
			const bValue = b[sortColumn].toLowerCase();
			return aValue.localeCompare(bValue) * (sortDirection === "ascending" ? 1 : -1);
		});
		return sorted;
	}, [items, sortColumn, sortDirection]);

	return (
		<div style={{overflowX:'auto', width:'100%'}}>
		<Table aria-label="Sortable Table" style={{width: '100%', minWidth: 600}}>
			<TableHeader>
				<TableRow>
					{columns.map((column, index) => (
						<TableHeaderCell key={column.key}
			                 onClick={() => column.isSortable && handleSort(column.key)}
			                 sortDirection={column.key === sortColumn ? sortDirection : undefined}
			                 style={{width: index==0?315:'auto'}}
						>
							{column.name}
						</TableHeaderCell>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{sortedItems.map((item) => {
						const id = item.theme + '-' + item.token;
						return <TableRow key={id} id={id}>
							<TableCell style={{wordBreak: 'break-word'}}>{item.token}</TableCell>
							<TableCell>{item.theme}</TableCell>
							<TableCell>
								<TableCellLayout media={<ColorDisplay color={item.color}/>}/>
							</TableCell>
						</TableRow>
					}
					)}
			</TableBody>
		</Table>
		</div>
	);
};
