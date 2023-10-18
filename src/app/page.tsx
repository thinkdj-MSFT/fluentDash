"use client"
import { Inter } from 'next/font/google'

import {Input, useId, Dropdown, Option } from "@fluentui/react-components";
import {HexColorPicker} from "react-colorful";
import {useEffect, useState} from "react";
import {TableView} from "@/app/Table";
import ColorDisplay from "@/app/partials/ColorDisplay";
const inter = Inter({ subsets: ['latin'] });

export type CustomColor = {
	token: string;
	theme: string;
	color: string;
};
type NearestColor = {
	distance: number;
	name: string;
	rgb: {
		r: number;
		g: number;
		b: number;
	};
	value: string;
};

export default function FluentDashColor() {

	const numberOfThemes = 5; // Change this based on the number of themes supported in the design tokens file

	/* Colors */
	const [allColors, setAllColors] = useState<CustomColor[]>([]); // Master
	const [allColorsFiltered, setAllColorsFiltered] = useState<CustomColor[]>([]); // Filtered
	const [closestColor, setClosestColor] = useState<any>(''); // Closest

	const [themes, setThemes] = useState([]);

	const [inputValue, setInputValue] = useState('#');
	const [colorPickerColor, setColorPickerColor] = useState('');

	const separatorCustom = '.'; // Internal

	const colorCategories = [
		'Foreground',
		'Background',
		'Hover',
		'Stroke',
		'Border',
		'Stencil',
	];

	useEffect(() => {
		fetch('./DesignTokens_Fluent.txt')
			.then(response => response.text())
			.then(text => {
				const linesArray: string[] = text?.trim()?.split('\n');
				const output = parseJsonFromText(linesArray, numberOfThemes);
				if(!allColors.length) {
					setAllColors(output); // Master
					setAllColorsFiltered(output); // Filtered
				}
			});
	}, []);

	const cleanup = (input:string) => {
		return input.trim().replace(/\r/g, '');
	}

	const parseJsonFromText = (input: string[], numThemes: number) => {
		const headers = input.slice(0, numThemes + 1).map(h=>cleanup(h));
		setThemes(headers.slice(1)); // Remove "Design Tokens" header for theme names
		const output = [];

		for (let i = 0; i < input.length; i += (numThemes + 1)) {
			if(i===0) continue; // Skip header row
			const row = input.slice(i, (i + numThemes) + 1);
			const tokenName = row[0];
			for (let j = 1; j < row.length; j++) {
				const rowObject: CustomColor = {
					token: cleanup(tokenName),
					theme: cleanup(headers[j]),
					color: cleanup(row[j]),
				};
				output.push(rowObject);
			}
		}
		return output;
	}

	function transformString(input: string, condition: 'underscoreToSpace' | 'spaceToUnderscore'): string {
		if (condition === 'underscoreToSpace') {
			return input.replace(/_/g, ' ');
		} else if (condition === 'spaceToUnderscore') {
			return input.replace(/ /g, '_');
		} else {
			throw new Error('Invalid condition. Use "underscoreToSpace" or "spaceToUnderscore".');
		}
	}


	function isValidHexColor(input: string): boolean {
		const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		return hexColorRegex.test(input);
	}

	//const nearestColor = require('nearest-color').from(colorsFormattedForNC);

	const handleInputChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
		const colorStr = e?.target?.value??'';
		setInputValue(colorStr);
		processColorInput(colorStr);
		if(isValidHexColor(colorStr)) setColorPickerColor(colorStr);
	}
	useEffect(() => {
		processColorInput(colorPickerColor);
	},[colorPickerColor,allColorsFiltered]);

	const processColorInput = (colorHexString: string) => {
		if (isValidHexColor(colorHexString)) {
			if(!allColorsFiltered || !allColorsFiltered?.length) return;
			let colorsFormattedForNC = allColorsFiltered.reduce((acc, color) => {
				const formattedKey = `${transformString(color.theme, 'spaceToUnderscore')}${separatorCustom}${color.token}`;
				acc[formattedKey] = isValidHexColor(color.color)?color.color:'#ffffff';
				return acc;
			}, {});
			const nearestColor = require('nearest-color').from(colorsFormattedForNC);
			const closestColor:NearestColor = nearestColor(colorHexString) ?? {};
			console.log (closestColor);
			const ccKey = closestColor?.name??'';
			const ccTheme = transformString(ccKey.split(separatorCustom)[0], 'underscoreToSpace');
			const ccToken = ccKey.split(separatorCustom)[1];
			const ccFromMaster = allColors?.find(color => color.token === ccToken && color.theme === ccTheme);
			const ccMerged = {...ccFromMaster, ...closestColor};
			setClosestColor(ccMerged??closestColor);
			setInputValue(colorHexString);
		}
	}

	const ddThemes = useId("ddThemes");
	const ddCat = useId("ddCat");
	const labelThemes = useId("lbThemes");
	const labelCat = useId("lbCategories");

	type Filters = {
		themes?: string[];
		categories?: string[];
	};
	const [filters, setFilters] = useState<Filters>({});

	const handleFilters = (optionsEmitted: any, filterType: 'themes' | 'categories') => {
		const filtersPassed = optionsEmitted?.selectedOptions;

		if (filtersPassed) {
			filters[filterType] = filtersPassed.map((f: any) => f);
		}

		setFilters({ ...filters });
		console.log('Filters updated:', filters);

		const themesFilterLen = filters.themes?.length ?? 0;
		const catFilterLen = filters.categories?.length ?? 0;

		const colorsFilteredByTheme = themesFilterLen > 0 ?
			allColors.filter((c: any) => filters.themes?.includes(c.theme)) :
			allColors;

		const colorsFilteredByTokenName = catFilterLen > 0 ?
			colorsFilteredByTheme.filter((c: any) =>
				filters.categories?.some(category =>
					c.token.toLowerCase().includes(category.toLowerCase())
				)
			) :
			colorsFilteredByTheme;

		setAllColorsFiltered(colorsFilteredByTokenName);
	};

	const renderAppliedFilters = (filterType) => {
		if (filters && filters[filterType.toLowerCase()]?.length > 0) {
			return `${filterType} - ${filters[filterType.toLowerCase()]?.join(', ')}`;
		} else {
			return `${filterType} - No Filters`;
		}
	};

	return (
		<main className={`flex min-h-screen flex-col p-24 ${inter.className}`}>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="p-0">
					<Input value={inputValue} onChange={handleInputChange} placeholder="HEX color code with # prefix" style={{minWidth:200}} />
					<div>
						<HexColorPicker color={colorPickerColor} onChange={setColorPickerColor} />
					</div>
				</div>
				<div className="p-0">

					<div>
						<label>Input color</label>
						<ColorDisplay color={colorPickerColor} />
					</div>


					<div>
						<label className="flex justify-between">Closest color <small className='text-gray-400'>Distance ~{Math.ceil(closestColor?.distance??0)}</small></label>
						<ColorDisplay color={closestColor} />
						<label htmlFor="">
							<a href={`#${closestColor?.theme}-${closestColor?.token}`}>Jump to color</a>
						</label>
					</div>
				</div>
			</div>


			<div className='py-8'>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="p-0">
						<div role="menuitemcheckbox" aria-labelledby={labelThemes}>
							<small><label id={labelThemes}>Themes</label></small>
							<Dropdown aria-labelledby={ddThemes} placeholder="Select themes to filter" multiselect style={{ width: '100%' }}
							          defaultValue={['Light','Dark']}
							          onOptionSelect={(e,d)=>handleFilters(d,'themes')} size="small"
							>
								{ themes.map((option) => (
									<Option key={option}>
										{option}
									</Option>
								)) }
							</Dropdown>
						</div>

					</div>
					<div className="p-0">
						<div role="menuitemcheckbox" aria-labelledby={labelCat}>
							<small><label id={labelCat}>Color Categories</label></small>
							<Dropdown aria-labelledby={ddCat} placeholder="Select color categories to filter" multiselect style={{ width: '100%' }} onOptionSelect={(e,d)=>handleFilters(d,'categories')} size="small">
								{ colorCategories.map((option) => (
									<Option key={option}>
										{option}
									</Option>
								)) }
							</Dropdown>
						</div>

					</div>
				</div>
			</div>

			{
				false &&
				allColorsFiltered.map((c,i)=><div key={i}>{c.token}{c.theme}</div>)
			}

			<small style={{paddingBottom:'1.25rem', paddingTop:'0.5rem', opacity: 0.64}}>
				Filtered by: {renderAppliedFilters('Themes')} | {renderAppliedFilters('Categories')}
			</small>

			<TableView data={allColorsFiltered} />

		</main>
	)
}
