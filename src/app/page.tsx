"use client"

import {Checkbox, Input, Radio, useId} from "@fluentui/react-components";
import {HexColorPicker} from "react-colorful";
import {useEffect, useState} from "react";

export default function FluentDashColor() {

	const numberOfThemes = 5; // Change this based on the number of themes supported in the design tokens file

	const [allColors, setAllColors] = useState([]);
	const [themes, setThemes] = useState([]);

	const [inputValue, setInputValue] = useState('');
	const [colorPickerColor, setColorPickerColor] = useState('');
	const [closestColor, setClosestColor] = useState('');

	useEffect(() => {
		fetch('./DesignTokens_Fluent.txt')
			.then(response => response.text())
			.then(text => {
				const linesArray = text?.trim()?.split('\n');
				const output = parseJsonFromText(linesArray, numberOfThemes);
				if(!allColors.length) setAllColors(output);
			});
	}, []);

	const cleanup = (input:string) => {
		return input.trim().replace(/\r/g, '');
	}

	const parseJsonFromText = (input, numThemes) => {
		const headers = input.slice(0, numThemes + 1);
		setThemes(headers.slice(1)); // Remove "Design Tokens" header for theme names
		const output = [];

		for (let i = 0; i < input.length; i += (numThemes + 1)) {
			if(i===0) continue; // Skip header row
			const row = input.slice(i, (i + numThemes) + 1);
			const tokenName = row[0];
			for (let j = 1; j < row.length; j++) {
				const rowObject = {
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

	let colorsFiltered = allColors.reduce((acc, color) => {
		const formattedKey = `${color.token}-${transformString(color.theme, 'spaceToUnderscore')}`;
		acc[formattedKey] = isValidHexColor(color.color)?color.color:'#ffffff';
		return acc;
	}, {});

	const nearestColor = require('nearest-color').from(colorsFiltered);

	const handleInputChange = (e?: React.ChangeEvent<HTMLInputElement>) => {
		const colorStr = e?.target?.value??'';
		setInputValue(colorStr);
		processColorInput(colorStr);
		if(isValidHexColor(colorStr)) setColorPickerColor(colorStr);
	}
	useEffect(() => {
		processColorInput(colorPickerColor);
	},[colorPickerColor]);

	const processColorInput = (colorHexString) => {
		if (isValidHexColor(colorHexString)) {
			const closestColor = nearestColor(colorHexString);
			const ccKey = closestColor.name;
			const ccTheme = transformString(ccKey.split('-')[1], 'underscoreToSpace');
			const ccToken = ccKey.split('-')[0];
			const ccFromMaster = allColors?.find(color => color.token === ccToken && color.theme === ccTheme);
			const ccMerged = {...ccFromMaster, ...closestColor};
			setClosestColor(ccMerged??closestColor);
			setInputValue(colorHexString);
		}
	}

	const radioName = useId("radio");
	const labelId = useId("label");

	return (
		<main className="flex min-h-screen flex-col items-center p-24">

			<h1>FluentDash</h1>
			<p>Fast and Fluentious</p>

			<Input value={inputValue} onChange={handleInputChange}/>

			<div className="colorPicker-preview" style={{borderLeftColor: colorPickerColor}}>
				Selected color {colorPickerColor}
			</div>

			<label id={labelId}>Themes</label>
			<div role="radiogroup" aria-labelledby={labelId}>
				<Radio name={radioName} value='' label="All" key={0}/>
				{ themes.map((theme, index) => {
					return <label key={index}><Checkbox name={radioName} value={theme}/>{theme}</label>
					{/*<Radio name={radioName} value={theme} label={theme} key={index}/>*/}
				}
				)}
			</div>


			Closest color is {closestColor?.name??''}
			{closestColor?.distance??''}
			{closestColor?.theme??''}

			<HexColorPicker color={colorPickerColor} onChange={setColorPickerColor}/>


		</main>
	)
}
