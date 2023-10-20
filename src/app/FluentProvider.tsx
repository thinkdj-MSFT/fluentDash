"use client"

import React from 'react';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

export default function FluentProviderClient({children}: {children: React.ReactNode}) {
	return (
		<FluentProvider theme={webLightTheme}>
			{children}
		</FluentProvider>
	);
}
