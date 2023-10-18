"use client"

import {Input, useId, Dropdown, Option, Tooltip} from "@fluentui/react-components";
import {HexColorPicker} from "react-colorful";
import {useEffect, useState} from "react";
import {TableView} from "@/app/Table";
import ColorDisplay from "@/app/partials/ColorDisplay";

import { Inter } from 'next/font/google';
import Image from "next/image";
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

	const [themes, setThemes] = useState<any[]>([]);

	const [inputValue, setInputValue] = useState<string>('#');
	const [colorPickerColor, setColorPickerColor] = useState<string>('');

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
			let colorsFormattedForNC: Record<string, string> = allColorsFiltered.reduce((acc:any, color:CustomColor) => {
				const formattedKey:string = `${transformString(color.theme, 'spaceToUnderscore')}${separatorCustom}${color.token}`;
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

	const renderAppliedFilters = (filterType:string) => {
		const filterTypeFormatted: string = filterType.toLowerCase();
		// @ts-ignore
		if (filters && filters[filterTypeFormatted]?.length > 0) {
			// @ts-ignore
			return `${filterType} - ${filters[filterTypeFormatted]?.join(', ')}`;
		} else {
			return `${filterType} - No Filters`;
		}
	};

	/* Scroll to top */
	const [showsScrolBtn, setShowScrolBtn] = useState(false);
	useEffect(() => {
		const handleButtonVisibility = () => {
			window.pageYOffset > 200 ? setShowScrolBtn(true) : setShowScrolBtn(false);
		};
		window.addEventListener("scroll", handleButtonVisibility);
		return () => {
			window.addEventListener("scroll", handleButtonVisibility);
		};
	}, []);
	const renderScrollToTop = () => (
		<div id="scrollToTop" onClick={() => { window.scrollTo({ top: 0, left: 0, behavior: "smooth" }); }}
		     style={{ position: "fixed", bottom: 32, right: 32, color: "gray", textAlign: "center", cursor: "pointer", fontSize: "2rem", lineHeight: 1, textDecoration: "none" }}
		>
			<Image src='/assets/up.svg' width={32} height={32} style={{width:32, height:32, opacity:0.5}} alt='' />
		</div>
	)
	/* / Scroll to top */


	return (
		<main className={`flex min-h-screen flex-col px-8 py-0 ${inter.className}`}>

			<div className="grid-inputs">
				<div className="p-0">
					<Input value={inputValue} onChange={handleInputChange} placeholder="HEX color code with # prefix" style={{minWidth:200}} />
					<div>
						<HexColorPicker color={colorPickerColor} onChange={setColorPickerColor} />
					</div>
				</div>
				<div className="p-0">

					<div className="pb-3 pt-3">
						<label>Input color</label>
						<ColorDisplay color={colorPickerColor} />
					</div>

					<div>
						<label className="flex justify-between">
							<span>Closest color</span>
							<Tooltip content="Nearest neighbor search" relationship="Label">
								<small className='text-gray-400'>Distance ~{Math.ceil(closestColor?.distance??0)}</small>
							</Tooltip>
						</label>
						<ColorDisplay color={closestColor} />
						<div style={{marginTop: -20, textAlign: 'right'}}>
							{closestColor?.theme ?
								<small>
									<Tooltip content={`Jump to ${closestColor?.token??''} in table`} relationship="Label">
										<a className="text-blue-800" href={`#${closestColor?.theme}-${closestColor?.token}`}>Jump to color</a>
									</Tooltip>
									&nbsp;&bull;&nbsp;
									<Tooltip content={`Copy token to clipboard`} relationship="Label">
										<a className="text-blue-800" href="javascript:void(0)" onClick={() => { navigator.clipboard.writeText(closestColor?.token); }}>Copy token</a>
									</Tooltip>
								</small>
								: null
							}
						</div>
					</div>
				</div>
			</div>

			<div className='py-4'>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="p-0">
						<div role="list" aria-labelledby={labelThemes}>
							<small><label id={labelThemes}>Themes</label></small>
							<Dropdown aria-labelledby={ddThemes} placeholder="Select themes to filter" multiselect style={{ width: '100%' }}
							          onOptionSelect={(e,d)=>handleFilters(d,'themes')} size="medium"
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
						<div role="list" aria-labelledby={labelCat}>
							<small><label id={labelCat}>Color Categories</label></small>
							<Dropdown aria-labelledby={ddCat} placeholder="Select color categories to filter" multiselect style={{ width: '100%' }} onOptionSelect={(e,d)=>handleFilters(d,'categories')} size="medium">
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

			<small className="pb-4">
				<label className="flex justify-between">
					<span className='text-gray-400'><Image src='/assets/filter.svg' width={10} height={10} style={{opacity: 0.5, display: 'inline-block', marginRight: 2}}  alt='' /> {renderAppliedFilters('Themes')} &bull; {renderAppliedFilters('Categories')}</span>
					<span className='text-gray-400'>{allColorsFiltered?.length??0} tokens</span>
				</label>
			</small>

			<TableView data={allColorsFiltered} />

			{/* Scroll to top */}
			{ showsScrolBtn && renderScrollToTop() }
			{/* / Scroll to top */}

		</main>
	)
}
